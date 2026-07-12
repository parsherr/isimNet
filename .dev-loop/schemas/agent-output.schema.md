# Agent Output Schema

Her future agent bu formatta çıktı üretmelidir.
Şu an Claude Code bu formatı manuel olarak üretir.

**Version:** 1.0

---

## Format

```markdown
# Agent Output

## Metadata

**Agent Name:** [agent adı]
**Agent Type:** planner | executor | reviewer | verifier | documentation | security | qa | memory
**Task ID:** YYYY-MM-DD-<slug>
**Started:** [tarih saat]
**Finished:** [tarih saat]
**Status:** success | failed | blocked | needs-human | partial

## Summary

[Ne yapıldı — 2-3 cümle]

## Inputs Used

- [input 1]
- [input 2]

## Files Inspected

- [dosya yolu] — [neden okundu]

## Files Changed

| File | Action | Summary |
|------|--------|---------|
| [dosya] | created/modified/deleted | [ne değişti] |

## Commands Run

| Command | Exit Code | Summary |
|---------|----------|---------|
| [komut] | 0/1/... | [özet] |

## Decisions Made

- [Karar 1] — [gerekçe]
- [Karar 2] — [gerekçe]

## Errors Encountered

| Error | File | Severity | Handled |
|-------|------|----------|---------|
| [hata] | [dosya] | warning/error/critical | yes/no |

## Risks Found

- [Risk] — [şiddet: low/medium/high]

## Verification Notes

[Bu çıktının doğrulanması için notlar]

## Memory Updates Needed

- [ ] project-map/[dosya].md — [ne güncellenmeli]
- [ ] decisions/ — [yeni karar varsa]

## Next Recommended Action

[Sonraki adım ne olmalı — 1 cümle]
```