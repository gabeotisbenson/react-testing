# react-testing

This project uses **bun exclusively** — as package manager and runtime. Never use npm, npx, yarn, pnpm, node, or nvm here.

- Install: `bun install` · add/remove: `bun add [-d] <pkg>`, `bun remove <pkg>`
- Scripts: `bun run dev|build|lint|preview|type-check|check-updates`
- Registry research: `bun info <pkg> [field]` (not `npm view`)
- Dependency updates: `bun run check-updates` (`bun outdated`), then per-group `bun add [-d] <pkg>@<ver>` — staged, gated (build/lint/type-check/dev smoke), one commit per group
- Scripts force the bun runtime via `--bun`; the lockfile is `bun.lock` (committed)
- A `preinstall` guard (`only-allow bun`) blocks other package managers
