# ADR-004: Static Hosting on Nginx with OCI VM

**Status:** Accepted
**Date:** 2026-03-19
**Author:** System Architect

## Decision

Host the Packman website as a pre-built static site served by Nginx on an Oracle Cloud Infrastructure (OCI) compute VM. The deployment pipeline is:

1. **Build** -- GitHub Actions builds the Astro site and compiles WASM artifacts on push to `main`.
2. **Deploy** -- GitHub Actions copies the built artifacts to the OCI VM via SSH/SCP.
3. **Serve** -- Nginx serves the static files directly from disk. No application server, no database, no server-side runtime.
4. **SSL** -- Let's Encrypt certificates managed by Certbot with automatic renewal via cron/systemd timer.

The Nginx configuration will include:

- Gzip/Brotli compression for HTML, CSS, JS, and WASM files.
- Cache-Control headers: immutable hashes for versioned assets (1 year), short TTL for HTML (5 minutes).
- MIME type mappings for `.wasm` (`application/wasm`) and other non-standard file types.
- Security headers (X-Content-Type-Options, X-Frame-Options for the top-level site, CSP).

## Rationale

The Packman website has no dynamic server-side requirements:

- **No user accounts** -- there is no authentication, authorization, or session management.
- **No database** -- all content is baked into the static build. Game scores are ephemeral and displayed client-side only.
- **No API** -- the site does not fetch data from a backend. Game assets are static files loaded by the WASM runtimes.
- **No server-side rendering** -- Astro produces static HTML at build time (see ADR-001).

Given these characteristics, introducing an application server (Node.js, Python, Java) or a managed platform with server-side capabilities would add unnecessary complexity, cost, and attack surface.

Nginx serving static files is:

- **Fast** -- Nginx handles static file serving with minimal overhead, easily saturating a 1Gbps network link on modest hardware.
- **Secure** -- No application runtime means no application-level vulnerabilities (SQL injection, RCE, SSRF). The attack surface is limited to Nginx itself and the OS.
- **Cheap** -- OCI's Always Free tier provides a VM with sufficient resources (1 OCPU, 1GB RAM) to serve a static site with moderate traffic. The only ongoing cost is the domain name.
- **Simple to operate** -- No process managers, no runtime version management, no dependency updates for a server application. Nginx and Certbot are the only services running.

Let's Encrypt with Certbot provides free, automated SSL certificates. Certbot's Nginx plugin handles certificate issuance, renewal, and Nginx configuration updates automatically.

GitHub Actions CI/CD provides:

- Automated builds on every push to `main`, ensuring the deployed site always matches the repository.
- Build caching for Emscripten SDK, pygbag, and other heavy dependencies.
- A clear audit trail of what was deployed and when.
- No additional CI/CD infrastructure to maintain.

## Alternatives Considered

### Vercel / Netlify / Cloudflare Pages

Managed static hosting platforms provide automatic builds, global CDN, preview deployments, and zero server management. They are excellent choices for most static sites. However:

- **WASM bundle sizes** -- The Python (~18MB) and Java (~30MB CDN) game variants push against free-tier bandwidth and asset size limits. Vercel's free tier allows 100GB bandwidth/month; a popular page with large WASM assets could exceed this.
- **Build time limits** -- Compiling three WASM toolchains (Emscripten, pygbag, CheerpJ assets) in CI may exceed the free-tier build time limits (typically 45 minutes on Vercel, 15 minutes on Netlify).
- **Custom headers** -- Setting COOP/COEP headers required by some WASM runtimes (for SharedArrayBuffer support) requires platform-specific configuration files that may not cover all edge cases.
- **Vendor lock-in** -- Platform-specific features (edge functions, image optimization APIs) can create dependencies that complicate migration.

An OCI VM with Nginx provides full control over headers, MIME types, caching, and build pipelines without tier limits.

### AWS S3 + CloudFront

S3 static hosting with CloudFront CDN is a production-grade solution used by large-scale static sites. However:

- The AWS free tier is time-limited (12 months), after which costs apply for S3 storage, CloudFront bandwidth, and Route 53 DNS.
- Configuration complexity is higher: S3 bucket policies, CloudFront distributions, Origin Access Identity, ACM certificates, and Route 53 hosted zones are all separate services that must be configured and maintained.
- For a low-traffic educational site, the operational overhead of managing multiple AWS services is disproportionate to the benefits.

### GitHub Pages

GitHub Pages is free and integrates directly with GitHub repositories. However:

- Repository size limit is 1GB, and the published site must be under 1GB. The combined WASM artifacts for three game variants may approach this limit.
- There is a soft bandwidth limit of 100GB/month.
- Custom headers cannot be set, which may prevent COOP/COEP configuration needed for WASM threading.
- Build customization is limited to Jekyll or GitHub Actions with `actions/deploy-pages`, and the build environment may not support all three WASM toolchains.

### Containerized Deployment (Docker + Nginx)

Wrapping Nginx in a Docker container and deploying to a container platform (Docker Compose on a VM, or a managed service like Cloud Run) adds a layer of abstraction. For a single static site with no sidecar services, the container provides no benefit over running Nginx directly on the host. It adds image build time, registry management, and container runtime overhead without solving any problem that bare Nginx does not already solve.

## Tradeoffs

- **No global CDN** -- A single OCI VM serves all requests from one geographic region. Users far from the VM's datacenter will experience higher latency than they would with a CDN. Mitigation: if traffic grows, a CDN (Cloudflare free tier, acting as a reverse proxy) can be placed in front of the VM without changing the deployment architecture.
- **Single point of failure** -- One VM means one failure domain. If the VM goes down, the site is offline. Mitigation: OCI VMs have high uptime SLAs; automated health checks and VM restart policies reduce downtime. For an educational project, brief outages are acceptable.
- **Manual server maintenance** -- The VM's OS, Nginx, and Certbot must be updated manually (or via unattended-upgrades). Managed platforms handle this automatically. This is a small but ongoing operational burden.
- **No preview deployments** -- Unlike Vercel/Netlify, there are no automatic preview URLs for pull requests. Reviewing visual changes requires building locally or adding a preview deployment step to the GitHub Actions workflow.
- **SSH key management** -- GitHub Actions needs SSH access to the VM for deployment. The SSH private key must be stored as a GitHub Actions secret and rotated periodically. This is a security-sensitive credential that must be managed carefully.
- **Scaling ceiling** -- A single VM has finite resources. If the site experiences unexpected traffic spikes (e.g., appearing on Hacker News), Nginx can handle significant concurrent connections for static content, but there is a hard ceiling. Adding horizontal scaling would require architectural changes (load balancer, multiple VMs, or migration to a managed platform).
