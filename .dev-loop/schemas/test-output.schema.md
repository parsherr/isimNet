# Test Output Schema

Test agent bu formatı kullanır. Phase 6.3'te üretilir.

---

## Schema

```yaml
test_output:
  # Kimlik
  test_report_id: "tr-[task-id]-[YYYYMMDD]"  # örn: tr-2026-05-07-api-guard-20260507
  task_id: "[task-id]"
  test_agent: "dev-loop-test"

  # İncelenen dosyalar
  changed_files:
    - "[dosya yolu]"

  # Önerilen kontroller
  suggested_checks:
    typecheck: "required | optional | not_applicable"
    lint: "required | optional | not_applicable"
    build: "required | optional | not_applicable"
    unit_test: "required | optional | not_applicable"
    integration_test: "required | optional | not_applicable"
    visual_test: "required | optional | not_applicable"

  # Çalıştırılan komutlar
  commands_expected:
    - "pnpm typecheck"
    - "pnpm lint"

  commands_run:
    - command: "pnpm typecheck"
      status: "passed | failed | not_run | error"
      summary: "[kısa özet]"
      output_excerpt: "[ilk N satır veya hata mesajı]"

  # Sonuçlar
  typecheck_result: "passed | failed | not_run"
  lint_result: "passed | failed | not_run | passed_with_warnings"
  build_result: "passed | failed | not_run"
  unit_test_result: "passed | failed | not_run"
  integration_test_result: "passed | failed | not_run"
  visual_test_result: "passed | failed | not_run | not_applicable"

  # Kapsam/güven
  coverage_confidence: "high | medium | low | unknown"

  # Eksik testler
  missing_tests:
    - description: "[ne test edilmeli]"
      priority: "high | medium | low"
      reason: "[neden gerekli]"

  # Riskler
  risks:
    - "[test eksikliğinden kaynaklanan risk]"

  # Onay kararı
  approval: "passed | passed_with_notes | changes_requested | blocked | skipped"

  # Düzeltme gereksinimleri
  required_fixes:
    - "[fix açıklaması]"

  # Sonraki önerilen testler
  suggested_next_tests:
    - "[test önerisi]"

  # Yazılan dosyalar
  files_written:
    - path: ".dev-loop/reports/tests/YYYY-MM-DD-slug.md"
      action: "created"

  # Sonraki adım
  next_recommended_action: "proceed-to-documentation | fix-and-recheck | blocked"
```

---

## Approval Decision Matrix

| Durum | Approval |
|-------|---------|
| Tüm çalıştırılan kontroller geçti | passed |
| Kontroller geçti ama önerilen test eksik | passed_with_notes |
| Bir veya daha fazla kontrol failed | changes_requested |
| Build veya typecheck failed | blocked |
| Kod değişikliği yok | skipped |

## Command Priority Matrix

| Değişiklik Tipi | TypeScript | Lint | Build | Tests |
|----------------|-----------|------|-------|-------|
| Frontend (.tsx) | required | required | optional | optional |
| Backend/API | required | required | optional | recommended |
| Config | required | optional | required | optional |
| Test dosyası | required | optional | optional | required |
| Docs-only | not_applicable | not_applicable | not_applicable | not_applicable |

## Kullanım Notu

- Bu schema `dev-loop.md` Phase 6.3'te üretilir.
- İlk versiyonda test-agent Bash çalıştırmaz; ana akışın verdiği outputları analiz eder.
- `blocked` → close-task öncesi açıkça raporlanır.
- `command_outputs` boşsa `not_run` yazar ve öneri ekler.
```