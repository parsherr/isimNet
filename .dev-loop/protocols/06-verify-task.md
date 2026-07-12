# Protocol 06 — Verify Task

**Triggers:** Tüm wave'ler tamamlandıktan sonra
**Purpose:** Hedefin gerçekten karşılanıp karşılanmadığını doğrula

## Input

- Request Understanding bloğu
- Plan dosyası (observable truths için)
- Tamamlanan task listesi (dosya yollarıyla)
- Log dosyası

## Steps

### Kod Doğrulaması (4 Seviye)

Her değiştirilen dosya için:

1. **Level 1 — Artifact:** Dosya oluşturulmuş/değiştirilmiş mi? (var mı?)
2. **Level 2 — Implementation:** Gerçek implementasyon mu? (stub/TODO/placeholder değil mi?)
3. **Level 3 — Connected:** Import edilmiş ve kullanılıyor mu? (dead code değil mi?)
4. **Level 4 — Data Flow:** Gerçek data akıyor mu? (hardcoded değil mi?)

### Proses Doğrulaması

- [ ] Plan dosyası oluşturulmuş mu?
- [ ] Success criteria'nın tamamı karşılandı mı?
- [ ] Observable truths'ların tamamı doğrulandı mı?
- [ ] Etkilenen project-map dosyaları güncellendi mi?
- [ ] Mimari karar alındıysa decisions/ kaydı yapıldı mı?
- [ ] Log dosyası güncellendi mi?
- [ ] Tool kullanımları `schemas/tool-output.schema.md` formatında loglandı mı?
- [ ] Task dosyası `schemas/task.schema.md` formatına uyuyor mu?

### Anti-Pattern Tarama

Değiştirilen dosyalarda şunları ara:
- `TODO` / `FIXME` / `HACK` yorumları
- `placeholder` / `stub` ifadeleri
- Hardcoded test verisi
- `console.log` (production kodu için)

## Output

`verification/YYYY-MM-DD-<task-slug>.md`:

```markdown
---
status: passed | gaps_found
score: [X]/[Y]
gaps:
  - truth: "[Observable truth]"
    status: failed
    reason: "[neden başarısız]"
    artifacts:
      - path: "[dosya yolu]"
        issue: "[sorun]"
    missing:
      - "[ne yapılmalı]"
---

# Verification Report — [Task Adı]

**Goal:** [hedef]
**Status:** passed / gaps_found
**Score:** [X]/[Y] truths verified

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | [truth] | ✓ VERIFIED / ✗ FAILED | [kanıt — dosya:satır] |

## Process Check

| Check | Status | Notes |
|-------|--------|-------|
| Plan oluşturuldu | ✓/✗ | |
| Success criteria karşılandı | ✓/✗ | |
| Project-map güncellendi | ✓/✗ | |
| Decisions kaydedildi (gerekiyorsa) | ✓/✗ | |
| Log tutuldu | ✓/✗ | |

## Anti-Pattern Findings

[Bulgu varsa listele, yoksa "None found"]
```

## Rules

- Dosyaları gerçekten oku (task listesine güvenme)
- Gap varsa → Team Lead'e ilet, bir sonraki iterasyonda planner'a geçirilir
- Proses kontrolü başarısız olursa da gaps_found say
- pnpm typecheck çalıştır (TypeScript projesi ise)

## Forbidden

- Düzeltme yapma
- "Muhtemelen çalışıyor" gibi tahminle PASSED verme
- Dosya okumadan doğrulama yapma