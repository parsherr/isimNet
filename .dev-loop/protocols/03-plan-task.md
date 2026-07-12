# Protocol 03 — Plan Task

**Triggers:** Protocol 02 tamamlandıktan sonra (Request Understanding hazır)
**Purpose:** Wave-based, detaylı uygulama planı oluştur

## Input

- Request Understanding bloğu
- Yüklenen context (Protocol 01'den)
- Gap YAML (re-plan ise — bir önceki iterasyondan)

## Steps

1. Etkilenecek dosyaları oku (tahmin değil, gerçekten oku)
2. `decisions/` klasörünü tara — mimari kararlarla çakışma var mı?
3. Wave yapısını belirle:
   - Bağımsız işler → aynı wave (paralel)
   - Bağımlı işler → farklı wave (sıralı)
4. Plan dosyasını yaz

## Output

`plans/YYYY-MM-DD-<task-slug>.md` dosyası:

```markdown
# Plan — [Task Adı]

**Date:** [tarih]
**Goal:** [hedef]
**Iteration:** [1 / 2 / 3...]

## Success Criteria

- [ ] [Kriter 1]
- [ ] [Kriter 2]

## Affected Files

- [dosya yolu] — [ne değişecek]

## Wave Structure

### Wave 1 (parallel)

- **Task A** | Agent: [Frontend/Backend] Writer | Files: `[dosya]`
  - What: [ne yapılacak]
  - Why: [neden gerekli]
  - Depends on: none

### Wave 2 (parallel)

- **Task B** | Agent: [Frontend/Backend] Writer | Files: `[dosya]`
  - What: [ne yapılacak]
  - Why: [neden gerekli]
  - Depends on: Task A

## Observable Truths (for verifier)

1. [Gözlemlenebilir sonuç 1]
2. [Gözlemlenebilir sonuç 2]

## Risks

- [Risk 1] — [önlem]

## Affected Project-Map Files

- project-map/[dosya].md — [ne güncellenmeli]

## Documentation Update Plan

- [ ] [Hangi docs güncellenecek]

## Rollback Plan

[Bir şeyler ters giderse ne yapılır]
```

Plan formatı referansı: `schemas/task.schema.md` → Steps ve Risks bölümleri

## Rules

- Her task tek bir dosyayı değiştirmeli (mümkünse)
- Dosyaları okumadan plan yazma
- Mimari değişiklik içeriyorsa decisions/ kontrol et
- Observable truths verifier için somut ve test edilebilir olmalı

## Forbidden

- Dosya okumadan "tahmin" ile plan yazma
- Wave'leri olmadan tüm taskları sıralı yazmak (her şey wave 1 olamaz)
- Boş risk listesi (en az 1 risk yaz)
- registry/tools.md'de "blocked" olan araçları planlama