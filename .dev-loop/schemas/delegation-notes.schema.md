# Delegation Notes Schema

Her completed task raporunun sonuna eklenir.
Amaç: Bugün Claude Code tek başına yaptığı işi, ileride hangi agent/tool/skill'e devredebileceğini kayıt altına almak.

**Version:** 1.0

---

## Format

```markdown
## Future Delegation Notes

**Could Be Delegated:** yes / no / partial
**Reason:** [neden evet/hayır/kısmi]

### Suggested Delegation

**Suggested Future Agent:** [agent adı — registry/agents.md'den]
**Required Tools:** 
- [tool adı] — [neden]

**Required Skills:**
- [skill adı] — [neden]

**Required Context Files:**
- [dosya yolu] — [neden]

### Input Package

Ileride bu task'ı bir agent'a devretmek için hazırlanması gereken input paketi:
- [input 1]: [açıklama]
- [input 2]: [açıklama]

### Expected Output From Delegated Module

[Agent bu task'ı devraldığında ne döndürmeli]

### Risks If Delegated

| Risk | Severity | Mitigation |
|------|----------|-----------|
| [risk] | low/medium/high | [önlem] |

**Human Approval Needed:** yes/no
**Approval Reason:** [neden onay gerekiyor/gerekmiyor]

### Implementation Notes

[Ileride bu delegation'ı implement etmek için notlar]
```

## Örnek

```markdown
## Future Delegation Notes

**Could Be Delegated:** yes
**Reason:** Task tamamen dosya operasyonları ve kod analizi içeriyor, user interaction gerektirmiyor.

### Suggested Delegation

**Suggested Future Agent:** executor-agent (frontend subtype)
**Required Tools:** 
- filesystem (read/write) — component dosyalarını okumak ve değiştirmek için

**Required Skills:**
- task-executor — kod değişikliği yapmak için
- code-reviewer — değişikliği doğrulamak için

**Required Context Files:**
- `.dev-loop/context/tech-stack.md` — framework bilgisi için
- `.dev-loop/project-map/frontend.md` — component hierarchy için

### Input Package

- `task_description`: Ne yapılacak
- `target_files`: Hangi dosyalar değiştirilecek
- `tech_stack`: Framework ve library bilgileri
- `coding_rules`: Proje standartları

### Expected Output From Delegated Module

- Değiştirilen dosyalar listesi
- Değişiklik özeti
- agent-output.schema.md formatında rapor

### Risks If Delegated

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Scope creep | medium | Task tanımı net tutulmalı |
| Pattern uyumsuzluğu | low | coding-rules.md context'e eklenmeli |

**Human Approval Needed:** no
**Approval Reason:** Değişiklik tamamen lokal, production'a dokunmuyor.

### Implementation Notes

executor-agent implement edildiğinde bu task için test case olarak kullanılabilir.
```