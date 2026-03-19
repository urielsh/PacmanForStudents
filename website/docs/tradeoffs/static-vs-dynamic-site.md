# Tradeoff Analysis: Static vs Dynamic Site Architecture

**Date:** 2026-03-19
**Status:** Decided
**Decision:** Static site (Nginx only)

---

## Context

Packman is an educational website that lets users play the same Pacman game implemented in 5 programming languages and compare the source code side by side. We need to decide whether to serve it as a purely static site (HTML/CSS/JS files served by Nginx) or build a dynamic backend (Node.js/Python/etc. with a database).

## Option A: Static Site (Nginx Only)

All content is pre-built HTML, CSS, and JS files. Nginx serves them directly. No application server, no database, no server-side logic.

### Architecture

```
User --> CDN (optional) --> Nginx --> static files
                                      /index.html
                                      /games/javascript/index.html
                                      /games/python/index.html
                                      /games/java/index.html
                                      /games/cpp/index.html
                                      /games/typescript/index.html
                                      /css/
                                      /js/
                                      /assets/
```

### Pros

| Advantage | Detail |
|---|---|
| **Zero server-side code** | No application server to write, debug, patch, or keep running. Nginx serves files -- that is the entire backend. |
| **Extremely fast** | Nginx serves static files with near-zero latency. Typical TTFB: 5-20 ms. No database queries, no template rendering, no API calls. |
| **Trivial deployment** | `rsync` files to server, or push to any static hosting (GitHub Pages, Netlify, Cloudflare Pages, S3+CloudFront). Deploy in seconds. |
| **CDN-ready out of the box** | Every file is cacheable with long-lived headers. Put Cloudflare in front for free and get global edge caching. |
| **Near-zero hosting cost** | Nginx on a $5/month VPS handles millions of requests. Static hosting services (GitHub Pages, Cloudflare Pages) are free. |
| **No security surface** | No database to breach, no API to exploit, no user data to leak. The attack surface is limited to Nginx configuration. |
| **No downtime from app crashes** | There is no app to crash. Nginx is one of the most stable servers in existence. Uptime is effectively 100%. |
| **Scales infinitely with CDN** | A CDN can handle any traffic spike. No need to scale application servers, databases, or session stores. |
| **Simple local development** | `python -m http.server` or `npx serve` to preview locally. No Docker, no database setup, no environment variables. |

### Cons

| Disadvantage | Detail |
|---|---|
| **No user accounts** | Cannot identify returning users. No login, no profiles. |
| **No server-side progress tracking** | Cannot save which languages a user has explored, what scores they achieved, or how far they got in code comparison. |
| **No saved preferences** | Theme choice, preferred language, last-played game -- all lost when the user clears browser storage. |
| **No server-side analytics** | Limited to client-side analytics (Google Analytics, Plausible, etc.) or Nginx access logs. |
| **No dynamic content** | Cannot personalize content, A/B test, or show user-specific recommendations. |
| **No API endpoints** | Cannot build features like "share your score" with a permalink, leaderboards, or commenting. |

### Mitigation for Cons

Most of the "missing" features can be approximated client-side:

- **Preferences**: `localStorage` persists theme, language choice, and last-played game across sessions on the same browser. Covers 95% of use cases.
- **Progress tracking**: `localStorage` can track which languages the user has tried. Lost on browser change/clear, but acceptable for an educational tool.
- **Analytics**: Plausible Analytics (privacy-friendly, ~1 KB script) provides page views, referrers, and basic engagement metrics without any server-side code.
- **Score sharing**: A client-side "share" button can generate a URL with score encoded in a query parameter or hash fragment. No server needed.

## Option B: Dynamic Site (Application Server + Database)

A backend application (e.g., Node.js/Express, Python/FastAPI, or similar) with a PostgreSQL or SQLite database, serving both the static game files and dynamic API endpoints.

### Architecture

```
User --> CDN --> Nginx (reverse proxy) --> App Server (Node/Python)
                                              |
                                              v
                                          PostgreSQL/SQLite
                                              |
                                              v
                                          Redis (sessions)
```

### What It Enables

| Feature | Implementation Cost | User Value |
|---|---|---|
| User accounts (signup/login) | ~3-5 days | Low -- users are here to learn, not create profiles |
| Progress tracking (server-side) | ~2-3 days | Low -- `localStorage` covers this adequately |
| Leaderboard | ~2-3 days | Low -- Pacman scores are not competitive; the focus is code comparison |
| Saved preferences (server-side) | ~1-2 days | Low -- `localStorage` covers this |
| Comments/discussion on code | ~5-7 days | Medium -- but existing tools (GitHub Discussions) serve this better |
| Admin dashboard | ~3-5 days | Low -- Nginx logs + Plausible cover analytics needs |

**Total estimated effort for a meaningful dynamic feature set: 15-25 days.**

### Pros

| Advantage | Detail |
|---|---|
| **User accounts** | Can identify users across devices and sessions. |
| **Server-side data persistence** | Progress, scores, preferences survive browser clears and device changes. |
| **API for future features** | Enables leaderboards, comments, code annotations, etc. |
| **Server-side analytics** | Full control over analytics data, no third-party dependency. |

### Cons

| Disadvantage | Detail |
|---|---|
| **15-25 days of backend development** | Significant effort for features with low user value in an educational context. |
| **Ongoing maintenance** | Database backups, security patches, dependency updates, server monitoring. |
| **Hosting cost increase** | Need a VPS capable of running the app server + database. ~$10-20/month minimum vs free static hosting. |
| **Security responsibility** | User accounts mean storing passwords (or OAuth tokens), which means security liability, GDPR/privacy compliance, and breach notification obligations. |
| **Deployment complexity** | Docker, environment variables, database migrations, health checks, process managers (systemd/PM2). |
| **Downtime risk** | Application servers crash, databases run out of connections, Redis fills up. Each component is a potential failure point. |
| **Over-engineering** | Building infrastructure for features nobody asked for. Classic YAGNI violation. |

## Side-by-Side Comparison

| Criterion | Static | Dynamic |
|---|---|---|
| Implementation effort | **~2 days** (Nginx config + HTML) | **15-25 days** |
| Hosting cost | **Free** (GitHub Pages) or **$5/mo** (VPS) | **$10-20/mo** minimum |
| Deployment | `rsync` or `git push` | Docker + CI/CD pipeline |
| TTFB | **5-20 ms** | 50-200 ms (app server overhead) |
| Uptime | **~100%** (Nginx only) | 99.5-99.9% (app server dependent) |
| Security surface | **Minimal** (Nginx only) | Significant (app + DB + sessions) |
| User accounts | No | Yes |
| Server-side persistence | No | Yes |
| Scalability | **Infinite with CDN** | Requires horizontal scaling |
| Maintenance burden | **Near zero** | Ongoing (patches, backups, monitoring) |

## YAGNI Analysis

The core question: **Does an educational Pacman website need user accounts and server-side persistence?**

The answer is no. Consider the user journey:

1. User arrives at the site.
2. User plays Pacman in one or more language implementations.
3. User views and compares source code across languages.
4. User learns something about how different languages approach the same problem.
5. User leaves.

At no point does this journey require authentication, a database, or server-side state. The user is here to learn and explore, not to create an account and build a profile.

Every dynamic feature we could add (leaderboards, progress tracking, saved preferences) either:
- Has low value in this context (nobody is competing for Pacman high scores on an educational site), or
- Can be adequately served by `localStorage` (preferences, progress), or
- Is better served by existing tools (GitHub Discussions for code discussion, Google Forms for feedback).

Building a dynamic backend would be a textbook YAGNI violation: spending 15-25 days of development effort and incurring ongoing maintenance costs for features that do not serve the educational mission.

## Decision

**Static site.**

Packman is an educational tool, not a social platform. Its value comes from the game implementations and code comparisons, not from user accounts or server-side persistence. A static site delivers this value with:

- Zero backend code to write or maintain.
- Free or near-free hosting.
- Near-instant page loads.
- Effectively zero downtime.
- No security liability from user data.

Client-side `localStorage` covers preferences and basic progress tracking. Plausible Analytics covers usage metrics. GitHub Discussions (or a simple feedback form) covers user interaction.

If a compelling need for server-side features emerges in the future, the static site can be incrementally enhanced with serverless functions (Cloudflare Workers, Netlify Functions) or a lightweight API -- without rebuilding the entire architecture. But until that need is demonstrated, YAGNI applies.

### Hosting Recommendation

For simplicity and zero cost:
1. **Primary:** GitHub Pages or Cloudflare Pages (free, CDN included, deploy via `git push`).
2. **Fallback:** Nginx on a $5/month VPS with Cloudflare free tier in front.

Either option handles the expected traffic (educational audience, likely <10,000 monthly visitors) with no performance concerns whatsoever.
