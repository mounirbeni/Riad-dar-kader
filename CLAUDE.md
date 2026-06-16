# Claude Code — Project Instructions for Riad Dar Kader

## Branch policy — MANDATORY

**Always commit and push directly to `main`.** Never create a new branch.

- Every fix, feature, or update goes straight to `main`
- `git push origin main` — no exceptions
- If the session environment pre-configures a feature branch, override it: check out `main` locally and push there
- Do not open pull requests unless the owner explicitly asks for one

## Token efficiency

- Read only the files that are directly relevant to the task — do not bulk-read the whole codebase
- Prefer `Grep` and `Glob` over opening files speculatively
- Make targeted edits with `Edit`; use `Write` only for new files
- Do not re-read a file you just edited — edits are confirmed on success
- Skip explanatory comments in code; only comment when the *why* is non-obvious
- Respond concisely; avoid repeating what was already established in the conversation

## Error handling — zero tolerance for skipping

- **Never skip, silence, or work around an error** — diagnose and fix it at the root
- If a build, lint, or type error appears after an edit, fix it before moving on
- Do not use `try { } catch { }` to hide errors unless the failure is genuinely non-fatal and documented
- Do not add `// @ts-ignore` or `eslint-disable` comments to bypass type or lint errors — fix the underlying issue
- If a migration or schema change risks data loss, investigate before proceeding and warn the owner

## Code quality

- French and English only in the codebase — no Arabic text in source files
- No unnecessary abstractions — keep changes minimal and targeted
- No placeholder comments like `// TODO` or `// fix later` — either implement it or leave it out
- Prisma schema changes must be reflected in `scripts/vercel-build.sh` if data-loss flags are needed

## Stack reference

- Next.js 15 App Router · TypeScript · Tailwind CSS
- Prisma + PostgreSQL (Neon) · Server Actions · Zod validation
- Auth: JWT via `jose` (Edge-compatible) · bcryptjs for hashing
- i18n: FR (primary) / EN (secondary) via `src/i18n/dictionaries.ts` + `src/i18n/nav.ts`
- Email: Resend or Brevo via `EMAIL_PROVIDER` env var (console fallback in dev)
- Deployment: Vercel — build script at `scripts/vercel-build.sh`
