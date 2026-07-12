# Protocol 04 — Execute Task

**Triggers:** Protocol 03 tamamlandıktan sonra (Plan hazır)
**Purpose:** Planı uygula, kodu yaz

## Input

- Plan dosyası (`plans/YYYY-MM-DD-slug.md`)
- Project-map context
- Decisions context

## Steps

Her wave için:
1. Wave'deki task'ları paralel dispatch et
2. Her task için Writer agent şunları yapar:
   a. Değiştirilecek dosyayı oku
   b. İlgili project-map dosyasını oku
   c. İlgili decisions'ı oku
   d. Değişikliği yap
   e. Değişiklik raporunu döndür
3. Log dosyasını güncelle
4. Sonraki wave'e geç (önceki tamamlandıysa)

## Output

- Değiştirilmiş dosyalar
- `logs/YYYY-MM-DD-<task-slug>.md` güncellendi
- Tool kullanımları: `schemas/tool-output.schema.md` formatında loglanır

## Log Format

`logs/YYYY-MM-DD-<task-slug>.md`:

```markdown
# Task Log — [Task Adı]

**Started:** [tarih saat]
**Plan:** plans/YYYY-MM-DD-slug.md

## Wave 1

### Task A — [açıklama]

- **Started:** [saat]
- **Files Read:** [okunan dosyalar]
- **Files Changed:** [değiştirilen dosyalar]
- **Commands Run:** [çalıştırılan komutlar]
- **Result:** success / failed
- **Errors:** [varsa]
- **Attempts:** 1 / 2

### Task B — [açıklama]

[aynı format]

## Wave 2

[aynı format]

## Summary

- Total tasks: [sayı]
- Completed: [sayı]
- Failed: [sayı]
- Blocked: [sayı]
```

## Rules

- Dosya okumadan değiştirme
- Her değişikliği log'a kaydet
- Hata olursa retry (max 2x), 2. başarısız olursa BLOCKED işaretle
- Wave'leri sırayla işle (Wave 2 Wave 1 bitmeden başlamaz)

## Forbidden

- Log tutmadan değişiklik yapma
- Plandaki dışına çıkma (scope creep)
- Birden fazla dosyayı tek task'ta değiştirme (mümkünse)
- registry/tools.md'de "blocked" kategorisindeki komutları çalıştırma
- "user-confirm" gerektiren komutları onaysız çalıştırma