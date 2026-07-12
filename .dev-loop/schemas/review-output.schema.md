# Review Output Schema

Reviewer agent bu formatı kullanır. Phase 3.5'te üretilir.

---

## Schema

```yaml
review_output:
  # Kimlik
  review_id: "rv-[task-id]-[N]"         # örn: rv-2026-05-07-tasks-due-date-01
  task_id: "[task-id]"
  reviewer: "dev-loop-reviewer"
  review_number: 1                        # kaçıncı review (max 2)

  # İncelenen dosyalar
  source_files_reviewed:                  # context için okunan dosyalar
    - "[dosya yolu]"
  changed_files_reviewed:                 # executor'ın değiştirdiği dosyalar
    - "[dosya yolu]"

  # Scope
  scope_compliance: true | false
  scope_notes: ""

  # Kod kalitesi
  code_quality_result: passed | passed_with_notes | failed
  quality_checks:
    readability: pass | warn | fail
    pattern_compliance: pass | warn | fail
    typescript_react_nextjs: pass | warn | fail
    simplicity: pass | warn | fail
    maintainability: pass | warn | fail
    edge_cases: pass | warn | fail
    performance: pass | warn | fail

  # Proje pattern uyumu
  project_pattern_compliance: pass | warn | fail
  pattern_notes: ""

  # Maintainability
  maintainability_notes: ""

  # Risk
  risk_level: "low | medium | high"

  # Bulgular
  issues_found:
    - id: "I1"
      severity: "critical | major | minor | suggestion"
      file: "[dosya:satır]"
      issue: "[sorun açıklaması]"
      fix: "[önerilen düzeltme]"

  # Düzeltme gereksinimleri
  required_fixes:                         # changes_requested/blocked ise dolu
    - "[fix açıklaması]"

  # Öneriler
  suggested_improvements:                 # minor/suggestion bulgular
    - "[öneri]"

  # Onay kararı
  approval: "approved | approved_with_notes | changes_requested | blocked"

  # Memory/documentation notları
  memory_documentation_notes: ""          # memory veya doc update gerekiyorsa

  # Yazılan dosyalar
  files_written:
    - path: ".dev-loop/reports/reviews/YYYY-MM-DD-slug.md"
      action: "created"

  # Sonraki adım
  next_recommended_action: "proceed-to-verifier | fix-and-re-review | blocked"
```

---

## Approval Decision Matrix

| Durum | Approval |
|-------|----------|
| Bulgu yok | approved |
| Yalnızca suggestion | approved |
| Yalnızca minor | approved_with_notes |
| En az 1 major | changes_requested |
| En az 1 critical | blocked |

## Risk Level Matrix

| Durum | Risk |
|-------|------|
| Yalnızca suggestion/minor | low |
| Major bulgu var | medium |
| Critical bulgu var | high |

## Kullanım Notu

- Bu schema `dev-loop.md` Phase 3.5'te reviewer agent tarafından üretilir.
- Verifier (Phase 4) bu schema'daki `approval` değerini okuyarak ilerleyip ilerlemeyeceğine karar verir.
- `changes_requested` veya `blocked` ise Phase 3.5 döngüsü tekrar çalışır (max 2x).
```