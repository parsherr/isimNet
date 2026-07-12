# Backend Executor Output Schema

Backend executor agent bu formatı kullanır. Phase 3'te üretilir.

---

## Schema

```yaml
backend_executor_output:
  # Kimlik
  executor_id: "be-[task-id]-[YYYYMMDD]"   # örn: be-2026-05-07-api-validation-20260507
  task_id: "[task-id]"
  executor_type: "backend-single-file"

  # Dosya kapsamı
  target_files:                              # planner'ın hedef dosyaları
    - "[dosya yolu]"
  allowed_files:                             # executor'ın yazabileceği dosyalar
    - "[dosya yolu]"

  # Kontroller
  forbidden_areas_checked: true | false
  pre_flight_result: "passed | blocked"
  pre_flight_notes: ""                       # blocked ise neden

  # Değişiklikler
  changes_made:
    - file: "[dosya:satır]"
      change: "[ne değiştirildi]"
      reason: "[neden]"
      change_type: "add | modify | delete"

  # Değiştirilen dosyalar
  files_changed:
    - "[dosya yolu]"

  # Güvenlik
  security_sensitive: "yes | no"
  security_review_required: "yes | no"      # backend executor için her zaman yes

  # Test önerileri
  tests_suggested:
    - "[önerilen test — örn: boş path ile POST /api/files/upload → 400 dönmeli]"

  # Riskler
  risks:
    - "[risk açıklaması]"

  # Çıktı durumu
  output_status: "success | failed | blocked | needs-human"
  output_notes: ""                           # ek bilgi

  # Yazılan dosyalar
  files_written:
    - path: ".dev-loop/logs/YYYY-MM-DD-slug.md"
      action: "created"
```

---

## Output Status Matrix

| Durum | Açıklama |
|-------|---------|
| success | Tüm değişiklikler allowed_files içinde yapıldı |
| failed | Teknik hata oluştu (TypeScript hatası, import sorunu vb.) |
| blocked | Pre-flight başarısız (allowed_files dışı, forbidden area) |
| needs-human | Değişiklik architectural karar gerektiriyor |

## Pre-flight Checklist

1. allowed_files listesi var mı?
2. target_files ⊆ allowed_files mi?
3. Hiçbir dosya forbidden_areas içinde mi?
4. Yeni dosya oluşturulacaksa planner açıkça izin verdi mi?

## Kullanım Notu

- Bu schema `dev-loop.md` Phase 3'te backend executor kullanıldığında üretilir.
- `security_review_required: yes` → Phase 3.7 security-agent zorunlu çalışır.
- `pre_flight_result: blocked` → executor çalışmaz, Team Lead'e bildirilir.
- `output_status: needs-human` → Team Lead devreye girer.
```