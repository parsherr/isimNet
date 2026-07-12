# Memory Output Schema

Memory Update agent'ı veya Phase 6 memory güncellemesi bu formatı kullanır.

---

## Schema

```yaml
memory_update:
  # Kimlik
  memory_update_id: "mu-[task-id]-[YYYYMMDD]-[seq]"  # örn: mu-task-003-20250507-01
  task_id: "[task-id]"                                 # kaynak task

  # Kaynak
  source_files_read:                    # bu güncellemeyi oluşturmak için okunan dosyalar
    - "[dosya yolu]"

  # Öğrenilen kalıplar
  durable_learnings:                    # kalıcı, tekrar kullanılabilir bilgiler
    - pattern: "[kalıp adı]"
      context: "[nerede/ne zaman geçerli]"
      value: "[ne öğrenildi]"

  # Proje tercihleri
  project_preferences_discovered:       # yeni tespit edilen tercih/kısıt
    - preference: "[tercih adı]"
      rule: "[kural]"
      rationale: "[gerekçe]"

  # Sorunlar
  recurring_issues_detected:            # tekrar eden veya yeni tespit edilen sorunlar
    - issue: "[sorun adı]"
      category: "build|test|runtime|tooling|dependency"
      symptoms: "[belirtiler]"
      resolution: "[çözüm veya boş]"

  # Kararlar
  decisions_extracted:                  # task sırasında alınan mimari/tasarım kararları
    - decision: "[karar]"
      rationale: "[neden]"
      alternatives_rejected: ["[seçenek]"]

  proposed_decisions:                   # önerilen ama henüz onaylanmamış kararlar
    - proposal: "[öneri]"
      reason: "[neden öneriliyor]"

  # Agent performansı
  agent_performance_notes:
    - agent: "[agent adı]"
      task_type: "[task tipi]"
      observation: "[gözlem]"
      recommendation: "[öneri]"

  # Devir teslim
  handoff_notes:
    status: "[nerede bırakıldı]"
    completed: ["[tamamlanan iş]"]
    pending: ["[bekleyen iş]"]
    blockers: ["[engelleyici]"]
    critical_context: "[sonraki agent'ın bilmesi gereken]"

  # Yönlendirme
  next_task_hints:                      # sonraki task için öneriler
    - hint: "[öneri]"
      priority: "high|medium|low"

  # Güncellenen dosyalar
  files_updated:
    - path: ".dev-loop/memory/learned-patterns.md"
      action: "appended|updated|no_change"
    - path: ".dev-loop/memory/recurring-issues.md"
      action: "appended|updated|no_change"
    - path: ".dev-loop/memory/project-preferences.md"
      action: "appended|updated|no_change"
    - path: ".dev-loop/memory/agent-performance.md"
      action: "appended|updated|no_change"
    - path: ".dev-loop/memory/handoff-notes.md"
      action: "appended|updated|no_change"
```

---

## Kullanım Notu

- Tüm alanlar opsiyoneldir; alakasız alanlar boş liste `[]` veya boş string `""` olarak bırakılır.
- `memory_update_id` çakışmaları önlemek için `[task-id]-[tarih]-[sıra]` formatını takip eder.
- Bu şema doğrudan `dev-loop.md` Phase 6'da veya ileride eklenecek `memory-agent`'ta kullanılır.
