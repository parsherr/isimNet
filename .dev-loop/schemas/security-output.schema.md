# Security Output Schema

Security agent bu formatı kullanır. Phase 3.7'de üretilir (conditional).

---

## Schema

```yaml
security_output:
  # Kimlik
  security_review_id: "sec-[task-id]-[N]"    # örn: sec-2026-05-07-api-auth-01
  task_id: "[task-id]"
  reviewer: "dev-loop-security"
  review_number: 1                             # kaçıncı review (max 2)

  # İncelenen dosyalar
  source_files_reviewed:                       # context için okunan dosyalar
    - "[dosya yolu]"
  changed_files_reviewed:                      # değişen dosyalar
    - "[dosya yolu]"

  # Güvenlik kapsamı
  security_scope:                              # tetiklenen riskli kategoriler
    - "api_endpoints"
    - "auth_session"
    - "server_actions"
    - "database"
    - "file_operations"
    - "config_env"

  # Risk
  risk_level: "none | low | medium | high | critical"

  # Bulgular
  findings:
    - id: "F1"
      severity: "critical | high | medium | low | info"
      file: "[dosya:satır]"
      finding: "[bulgu açıklaması]"
      evidence: "[kanıt — kod satırı veya pattern]"
      fix: "[önerilen düzeltme]"
      affected_files:
        - "[dosya yolu]"

  # Düzeltme gereksinimleri
  required_fixes:                              # changes_requested/blocked ise dolu
    - "[fix açıklaması]"

  # Önerilen mitigasyonlar
  suggested_mitigations:                       # passed_with_notes bulgular
    - "[mitigation önerisi]"

  # Onay kararı
  approval: "passed | passed_with_notes | changes_requested | blocked"

  # Human approval
  human_approval_required: true | false        # high/critical risk varsa true

  # Yazılan dosyalar
  files_written:
    - path: ".dev-loop/reports/security/YYYY-MM-DD-slug.md"
      action: "created"

  # Sonraki adım
  next_recommended_action: "proceed-to-verifier | fix-and-re-review | blocked-human-review"
```

---

## Approval Decision Matrix

| Durum | Approval | Human Approval |
|-------|----------|----------------|
| Bulgu yok veya info/low | passed | false |
| Medium bulgu var | passed_with_notes | false |
| High bulgu var | changes_requested | true |
| Critical bulgu var | blocked | true |

## Risk Level Matrix

| Durum | Risk Level |
|-------|-----------|
| Bulgu yok | none |
| Yalnızca info | none |
| Low bulgu var | low |
| Medium bulgu var | medium |
| High bulgu var | high |
| Critical bulgu var | critical |

## Security Scope Trigger Map

| Kapsam | Tetikleyici Dosya Pattern |
|--------|--------------------------|
| api_endpoints | `app/api/**` |
| server_actions | `lib/actions/**` |
| auth_session | `lib/auth/**`, `middleware.ts` |
| database | `lib/db/**`, `prisma/**` |
| file_operations | upload/download logic içeren dosyalar |
| config_env | `package.json`, `.env*`, config files |

## Kullanım Notu

- Bu schema `dev-loop.md` Phase 3.7'de conditional olarak üretilir.
- Tetikleyici yoksa (frontend-only task) phase atlanır.
- `changes_requested` veya `blocked` → fix döngüsüne gir (max 2x).
- `human_approval_required: true` → close-task protokolünde human onayı beklenir.
```