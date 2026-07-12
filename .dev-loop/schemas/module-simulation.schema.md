# Module Simulation Schema

Her simulation dosyası bu formatı kullanır.
Amaç: task akışının ileride nasıl modüllere bölüneceğini belgelemek.

**Version:** 1.0

---

## Format

```markdown
# Module Simulation — [Task Adı]

## Metadata

**Simulation ID:** YYYY-MM-DD-<slug>-sim
**Task ID:** YYYY-MM-DD-<slug>
**Created:** [tarih saat]
**Execution Mode:** single-claude-code

## Original Task

[Task'ın kısa özeti]

---

## Simulated Modules

### Module 1: [Agent Adı]

**Type:** agent
**Registry Reference:** registry/agents.md → [agent-name]
**Delegatable:** yes / no / partial
**Reason:** [neden delegatable veya değil]

**Input Package:**
```yaml
task_description: "[ne yapılacak]"
target_files:
  - "[dosya yolu]"
context_files:
  - "[context dosyası]"
relevant_decisions:
  - "[varsa]"
```

**Expected Output:**
- [beklenen çıktı 1]
- [beklenen çıktı 2]

**Actual Single-Claude Execution:**
[Claude Code bu modül yokken ne yaptı / ne yapacak]

**Skill Coverage:**
- registry/skills.md → [skill-name]: [kaç adım karşılandı]

---

### Module 2: [Tool/Skill Adı]

**Type:** tool / skill
**Registry Reference:** registry/tools.md → [category] / registry/skills.md → [skill-name]
**Approval Level:** auto / log-only / user-confirm / blocked
**Human Approval Required:** yes / no

**Usage:**
[Nasıl kullanılacak]

**Expected Output:**
[Ne döndürmeli]

**Actual Single-Claude Execution:**
[Claude Code bunu nasıl yaptı]

---

## Summary Table

| Module | Type | Delegatable | Approval | Priority |
|--------|------|------------|----------|---------|
| [agent/tool/skill adı] | agent/tool/skill | yes/no/partial | auto/user | high/medium/low |

---

## Gaps Found

[Mevcut registry'de karşılanamayan ihtiyaçlar]

- [ ] [Gap 1] — [önerilen çözüm]

---

## Human Approval Points

Şu adımlarda mutlaka insan onayı gerekir:
1. [Adım] — [neden]

---

## Future Implementation Priority

| Module | Priority | Reason |
|--------|---------|--------|
| [modül] | high/medium/low | [gerekçe] |

---

## Notes

[Ek notlar, gözlemler]
```