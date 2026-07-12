# Team Lead Plan Schema

Team Lead planning agent bu formatı kullanır.

---

## Schema

```yaml
team_lead_plan:
  # Kimlik
  plan_id: "tlp-[YYYYMMDD]-[slug]"        # örn: tlp-20260508-files-api-security
  plan_version: "v0.1"
  created: "YYYY-MM-DD"
  project_root: "/absolute/path/to/project"

  # İstek
  original_request: "[kullanıcının tam isteği]"
  interpreted_objective: "[Team Lead'in anladığı gerçek amaç]"
  scope: "[kapsam içindeki alanlar]"
  out_of_scope: "[kapsam dışı — neden]"

  # Varsayımlar ve sorular
  assumptions:
    - "[varsayım 1]"
    - "[varsayım 2]"

  clarifying_questions:               # Cevap beklenmeden devam edildi ama bilinmesi plan kalitesini artırır
    - question: "[soru]"
      impact: "[cevabın plana etkisi]"
      default_assumed: "[şu an varsayılan cevap]"

  # Risk değerlendirmesi
  risk_assessment:
    overall_risk: "low | medium | high | critical"
    risks:
      - id: "R1"
        description: "[risk açıklaması]"
        severity: "critical | high | medium | low"
        affected_files: ["[dosya]"]
        mitigation: "[azaltma stratejisi]"
        requires_human_approval: true | false

  # Okunan dokümanlar
  required_docs_read:
    - "[.dev-loop/context/known-risks.md]"
    - "[.dev-loop/project-map/security.md]"
    - "[...]"

  # Task breakdown
  task_breakdown:
    - task_id: "T1"
      title: "[task başlığı]"
      description: "[ne yapılacak — tek cümle]"
      executor_type: "frontend-single-file | backend-single-file | single-claude | human-required"
      pipeline:
        - "executor-backend"        # sırayla
        - "reviewer"
        - "security"
        - "verifier"
        - "test"
        - "documentation"
        - "memory"
      allowed_files:
        - "[dosya yolu]"
      forbidden_areas:
        - "[yasak alan]"
      depends_on: []                # önceki task_id'ler
      can_parallelize_with: []      # bağımsız task_id'ler
      security_agent_required: true | false
      human_approval_required: true | false
      human_approval_reason: "[neden onay gerekiyor — yoksa boş]"
      estimated_complexity: "trivial | simple | moderate | complex"
      success_criteria:
        - "[observable truth 1]"
        - "[observable truth 2]"
      dev_loop_prompt: "[bu task için /dev-loop'a verilecek prompt önerisi]"

  # Bağımlılık grafiği
  task_dependencies:
    - from: "T1"
      to: "T2"
      reason: "[neden T2, T1'e bağımlı]"

  # Paralel task grupları
  parallel_groups:
    - group: 1
      tasks: ["T3", "T4"]
      reason: "[neden paralel çalışabilir]"

  # Human approval noktaları
  human_approval_points:
    - before_task: "T2"
      reason: "[neden onay gerekiyor]"
      what_to_review: "[kullanıcı neye bakmalı]"

  # Execution order
  execution_order:
    - step: 1
      tasks: ["T1"]
      type: "sequential"
    - step: 2
      tasks: ["T2"]
      type: "sequential"
      requires_approval_before: true
    - step: 3
      tasks: ["T3", "T4"]
      type: "parallel"

  # Stop conditions
  stop_conditions:
    - "[Security-agent blocked → dur, kullanıcıya bildir]"
    - "[Verifier gaps_found 3. kez → dur, mimari karar gerek]"
    - "[Human approval verilmedi → dur]"

  # Başarı kriterleri (tüm task'lar tamamlandığında)
  overall_success_criteria:
    - "[kriter 1 — observable truth]"
    - "[kriter 2]"

  # Final deliverables
  final_deliverables:
    - "[ne elde edilmiş olacak]"

  # Meta
  plan_file: ".dev-loop/team-lead/plans/YYYY-MM-DD-<slug>.md"
  status: "draft | approved | in-progress | completed | cancelled"
  approved_by: "human | n/a"
  approval_date: "YYYY-MM-DD | n/a"
```

---

## Task Executor Type Matrix

| Değişiklik | executor_type | security_agent |
|-----------|--------------|----------------|
| Frontend component, hooks, UI | `frontend-single-file` | skip |
| API route, Server Action | `backend-single-file` | required |
| Config, env | `backend-single-file` | required |
| Read-only analysis | `single-claude` | not applicable |
| Auth, middleware | `human-required` | required |
| DB schema/migration | `human-required` | required |

## Risk to Human Approval Matrix

| Risk Severity | human_approval_required |
|--------------|------------------------|
| critical | true |
| high | true |
| medium | false (ama not olarak ekle) |
| low | false |

## Kullanım Notu

- `dev_loop_prompt` alanı: Task çalıştırılırken `/dev-loop` komutuna verilecek önerilen prompt.
  Kullanıcı bunu kopyalayıp yapıştırabilir veya düzenleyebilir.
- `status: draft` → Team Lead üretildi, henüz onaylanmadı.
- `status: approved` → Kullanıcı onayladı, execution başlayabilir.
- Planlar `${project_root}/.dev-loop/team-lead/plans/` altında tutulur — `plans/` değil.