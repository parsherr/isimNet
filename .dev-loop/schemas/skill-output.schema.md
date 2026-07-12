# Skill Output Schema

Her skill/procedure çalıştırıldıktan sonra bu formatta rapor üretilir.

**Version:** 1.0

---

## Format

```markdown
# Skill Output

## Metadata

**Skill Name:** [skill adı]
**Trigger Reason:** [neden tetiklendi]
**Task ID:** YYYY-MM-DD-<slug>
**Started:** [tarih saat]
**Finished:** [tarih saat]

## Inputs

- [input 1]
- [input 2]

## Procedure Followed

- [x] Adım 1: [açıklama]
- [x] Adım 2: [açıklama]
- [ ] Adım 3: [atlandıysa nedeni]

## Output

[Skill'in ürettiği ana çıktı — özet]

## Files Written

| File | Action |
|------|--------|
| [dosya yolu] | created/modified |

## Memory Updates

- [ ] [güncellenen hafıza dosyası] — [ne değişti]

## Gaps

[Tamamlanamayan şeyler — varsa]

## Next Action

[Sonraki adım]
```