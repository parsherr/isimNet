# Tool Output Schema

Her tool kullanımı bu formatta loglanır.
`.dev-loop/logs/` dosyalarında tool çıktıları bu standarda uygun olmalı.

**Version:** 1.0

---

## Format

```markdown
## Tool Use Log

**Tool Name:** [tool adı]
**Tool Category:** filesystem | terminal | git | package-manager | test-runner | browser | screenshot | search | documentation-generator
**Command / Action:** [tam komut veya işlem]
**Reason for Use:** [neden kullanıldı — 1 cümle]
**Approval Required:** yes/no
**Approval Status:** auto-approved | user-approved | blocked | pending

**Started At:** [tarih saat]
**Finished At:** [tarih saat]
**Duration:** [ms veya s]

**Exit Status:** 0 (success) | [hata kodu]

**Output Summary:**
[Çıktının kısa özeti — max 5 satır]

**Error Summary:**
[Hata varsa özet, yoksa: none]

**Files Affected:**
- [dosya yolu] — [nasıl etkilendi]

**Follow-up Required:** yes/no
**Follow-up Action:** [gerekiyorsa ne yapılmalı]
```

## Örnek

```markdown
## Tool Use Log

**Tool Name:** terminal
**Tool Category:** terminal
**Command / Action:** `pnpm typecheck`
**Reason for Use:** TypeScript hatası olmadığını doğrulamak
**Approval Required:** no
**Approval Status:** auto-approved

**Started At:** 2026-05-07 18:30:00
**Finished At:** 2026-05-07 18:30:08
**Duration:** 8000ms

**Exit Status:** 0

**Output Summary:**
Found 0 errors in 12 files.

**Error Summary:** none

**Files Affected:** none (read-only check)

**Follow-up Required:** no
```