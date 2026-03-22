# Agent Communication Log

## Format for Agent-to-Agent Messages
When Agent X needs Agent Y's attention:
```
[AGENT HAND-OFF]
From: Game Engine Agent
To: UI Agent
Priority: HIGH
Subject: Game State API Change
Message: GameLogic now exposes getGhostPositions() as List<Point>
Action Needed: Update rendering to use new API
```

## Escalation to Orchestrator
When agents are stuck or conflicted:
```
[ESCALATE TO ORCHESTRATOR]
Agent: Game Engine
Conflict: UI Agent wants different state format
Reason: Spec is ambiguous about ghost position representation
Options:
  A) Use Point objects
  B) Use int[] arrays
Recommendation: Option A (type safety)
Awaiting: Human decision
```

## Status Board
| Agent | Status | Last Update | Blocker |
|-------|--------|-------------|---------|
| PM | Pending | — | None |
| Arch | Pending | — | None |
| Game Engine | Pending | — | None |
| UI | Pending | — | None |
| DevOps | Pending | — | None |
| QA | Pending | — | None |
| Integrator | Pending | — | None |
