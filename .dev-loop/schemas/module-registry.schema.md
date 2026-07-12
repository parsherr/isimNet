# Module Registry Schema

Sisteme yeni agent, tool veya skill eklenirken doldurulacak kayıt formatı.

**Version:** 1.0

---

## Agent Registration Format

`registry/agents.md` dosyasına eklenir:

```markdown
### [agent-name]

**Purpose:** [tek cümle açıklama]

**Trigger:** [ne zaman çağrılır]

**Inputs:**
- [input 1]
- [input 2]

**Outputs:**
- [output 1]

**Allowed Actions:**
- [aksiyon 1]

**Forbidden Actions:**
- [yasak aksiyon 1]

**Required Context Files:**
- [dosya yolu]

**Writes To:**
- [dosya yolu]

**Notes for Future Implementation:**
- [not]
```

---

## Tool Registration Format

`registry/tools.md` dosyasına eklenir:

```markdown
## Tool: [tool-name]

**Purpose:** [tek cümle açıklama]

**Allowed Usage:**
- [kullanım]: `auto | log-only | user-confirm | blocked`

**Forbidden Usage:**
- [yasak kullanım]

**Required Approval Level:** [en kısıtlayıcı seviye]

**Expected Output Format:**
```
{
  field1: type,
  field2: type
}
```

**Logging Requirements:** [ne loglanmalı]

**Failure Behavior:** [hata durumunda ne olur]
```

---

## Skill Registration Format

`registry/skills.md` dosyasına eklenir:

```markdown
### [skill-name]

**Purpose:** [tek cümle açıklama]

**Trigger:** [ne zaman çalışır]

**Inputs:**
- [input 1]

**Procedure Summary:**
1. [Adım 1]
2. [Adım 2]

**Outputs:**
- [output 1]

**Files Written:**
- [dosya yolu]

**Memory Updates:** [varsa]

**Related Protocols:** `protocols/[dosya].md`
**Related Agents:** [agent adı]
**Related Tools:** [tool adı]

**Future Executable Version Notes:**
- [not]
```

---

## Module Validation Checklist

Yeni modül eklenirken şu kontrolleri yap:

- [ ] Registry dosyasına format uygun şekilde eklendi
- [ ] Approval level açıkça belirtildi (tool ise)
- [ ] Allowed/Forbidden actions net tanımlandı
- [ ] Output format belirtildi
- [ ] Related protocols/agents/tools bağlandı
- [ ] Logging requirements yazıldı
- [ ] Failure behavior tanımlandı