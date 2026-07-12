# Protocol 05 — Review Task

**Triggers:** Her Writer agent tamamlandıktan hemen sonra
**Purpose:** Kod kalitesini denetle

## Input

- Değiştirilen dosyaların listesi
- Değişiklik özeti (Writer agent raporundan)

## Steps

1. Değiştirilen her dosyayı oku
2. Kontrol listesini uygula:
   - TypeScript hataları var mı?
   - ESLint ihlalleri var mı?
   - Mantık hataları var mı?
   - Proje pattern'larına uyuyor mu? (coding-rules.md)
   - Import'lar doğru mu?
   - Edge case'ler ele alındı mı?
3. Review raporunu yaz

## Output

`reports/reviews/YYYY-MM-DD-<task-slug>-<wave>-<task>.md`:

```markdown
# Code Review — [Task Adı]

**Date:** [tarih]
**Files Reviewed:** [liste]
**Result:** PASSED / FAILED

## Issues

| Severity | File | Line | Issue | Fix Required |
|----------|------|------|-------|-------------|
| critical/major/minor | [dosya] | [satır] | [sorun] | yes/no |

## Required Fixes

- [ ] [Düzeltilmesi zorunlu şey]

## Suggestions (optional)

- [Önemsiz iyileştirme önerisi]

## Summary

[Genel değerlendirme — 1-2 cümle]
```

## Rules

- FAILED → Writer'a geri gönder (review notlarıyla)
- Max 2 retry — 2. FAILED → task BLOCKED
- Minor issue varsa PASSED + note (blok etme)
- Critical issue varsa mutlaka FAILED

## Forbidden

- Düzeltme yapma (sadece raporla)
- Minor issue için FAILED verme
- Dosya okumadan review yapma