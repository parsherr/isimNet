# Task Schema

Her `.dev-loop/tasks/` dosyası bu formatı kullanır.
Bu schema, ileride agentlara iş paslanırken ortak dil görevi görür.

**Version:** 1.0

---

## Format

```markdown
# Task: [Başlık]

## Metadata

**Task ID:** YYYY-MM-DD-<slug>
**Created:** [tarih saat]
**Status:** pending | in-progress | review | blocked | completed | failed
**Priority:** low | medium | high | critical

## Original Request

[Kullanıcının ham isteği — değiştirilmeden]

## Interpreted Goal

[Claude'un yorumladığı hedef — 1-2 cümle]

## Scope

[Neyi kapsar]

## Out of Scope

[Neyi kapsamaz]

## Success Criteria

- [ ] [Gözlemlenebilir, test edilebilir kriter 1]
- [ ] [Gözlemlenebilir, test edilebilir kriter 2]

## Affected Areas

- Frontend: yes/no
- Backend: yes/no
- Database: yes/no
- Config: yes/no
- Documentation: yes/no

## Required Context

- [ ] `.dev-loop/context/tech-stack.md`
- [ ] `.dev-loop/context/coding-rules.md`
- [ ] `.dev-loop/project-map/[ilgili dosya].md`
- [ ] `.dev-loop/decisions/[ilgili karar].md` (varsa)

## Required Protocols

- [ ] `protocols/01-start-task.md`
- [ ] `protocols/02-understand-request.md`
- [ ] `protocols/03-plan-task.md`
- [ ] `protocols/04-execute-task.md`
- [ ] `protocols/05-review-task.md`
- [ ] `protocols/06-verify-task.md`
- [ ] `protocols/07-update-memory.md`
- [ ] `protocols/08-close-task.md`

## Required Tools

- [ ] filesystem (read/write)
- [ ] terminal: [hangi komutlar]
- [ ] git (gerekiyorsa)
- [ ] screenshot (gerekiyorsa)

## Required Skills

- [ ] request-understanding
- [ ] task-planner
- [ ] task-executor
- [ ] code-reviewer
- [ ] task-verifier
- [ ] memory-updater
- [ ] final-reporter
- [ ] security-review (backend ise)
- [ ] visual-qa (frontend ise)

## Steps

1. [Adım 1]
2. [Adım 2]

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [risk] | low/medium/high | low/medium/high | [önlem] |

## Test Plan

- [ ] TypeScript: `pnpm typecheck`
- [ ] Lint: `pnpm lint`
- [ ] Tests: `pnpm test` (framework varsa)
- [ ] Visual: screenshot (UI ise)

## Verification Plan

[Observable truths — verifier bu listeden doğrulama yapacak]

## Expected Output

[Task tamamlandığında ne görülecek — kullanıcı perspektifinden]

## Memory Updates Required

- [ ] project-map/[dosya].md
- [ ] context/known-risks.md (gerekiyorsa)
- [ ] decisions/ (yeni mimari karar varsa)
- [ ] state/current.md
- [ ] state/history.md

## Future Delegation Notes

**Could be delegated:** yes/no
**Suggested future agent:** [agent adı]
**Required tools:** [liste]
**Required skills:** [liste]
**Required context files:** [liste]
**Input package needed:** [hangi bilgilerin paketlenmesi gerekiyor]
**Expected output from delegated module:** [ne döndürmeli]
**Risks if delegated:** [liste]
**Human approval needed:** yes/no

## Closed

**Closed:** [tarih] (doldurulur tamamlandığında)
**Report:** `reports/YYYY-MM-DD-slug.md`
```