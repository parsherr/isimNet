# Protocol 02 — Understand Request

**Triggers:** Protocol 01 tamamlandıktan hemen sonra
**Purpose:** Kullanıcı isteğini net, yapılandırılmış hale getir

## Input

- Ham kullanıcı isteği
- Yüklenen context (Protocol 01'den)

## Steps

1. İsteği analiz et:
   - Ne yapılmak isteniyor? (Goal)
   - Hangi alanlar etkilenecek? (Scope)
   - Ne yapılmayacak? (Out of scope)
   - Başarı nasıl ölçülecek? (Success criteria)
   - Hangi dosyalar etkilenecek? (Affected areas)

2. Belirsizlikleri tespit et:
   - Kritik belirsizlik: Olmadan yanlış iş yapılır → SORU SOR (max 2 soru)
   - Düşük belirsizlik: Makul varsayım yapılabilir → VARSAYIMI YAZ ve devam et

3. `Request Understanding` bloğunu oluştur

## Output Format

Aktif task dosyasına (`tasks/active/YYYY-MM-DD-slug.md`) yaz:

```markdown
## Request Understanding

**Goal:** [ne yapılmak isteniyor — 1 cümle]
**Scope:** [neyi kapsar]
**Out of Scope:** [neyi kapsamaz]
**Success Criteria:**
- [ ] [Kriter 1 — gözlemlenebilir ve test edilebilir]
- [ ] [Kriter 2]
**Affected Areas:** [frontend / backend / both / other]
**Affected Files (estimated):** [dosya listesi veya tahmin]
**Questions:** [kritik belirsizlik varsa — max 2]
**Assumptions:** [yapılan varsayımlar listesi]
```

## Rules

- Success criteria GÖZLEMLENEBILIR olmalı ("çalışır" değil, "kullanıcı X butonuna basınca Y görülür")
- Max 2 soru sor — daha fazlası varsa en kritik 2'yi seç
- Belirsizlik düşükse soru sorma, varsayım yaz
- Kapsam dışını netleştir — scope creep önler

## Forbidden

- "Ne yapmamı istersiniz?" gibi açık uçlu soru sorma
- Success criteria olmadan planlama aşamasına geçme