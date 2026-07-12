# Protocol 08 — Close Task

**Triggers:** Protocol 07 (Memory Update) tamamlandıktan sonra
**Purpose:** Task'ı kapat, final raporu oluştur, kullanıcıya sun

## Input

- Verification raporu
- Log dosyası
- Memory update özeti
- Memory agent output (Phase 6.7'den)

## Steps

1. Final raporu oluştur
2. Active task dosyasını completed'a taşı
3. Kullanıcıya raporu sun

## Output

### Final Report

`reports/YYYY-MM-DD-<task-slug>.md`:

```markdown
# Final Report — [Task Adı]

**Date:** [tarih]
**Goal:** [hedef]
**Iterations:** [kaç iterasyon aldı]
**Result:** SUCCESS / PARTIAL / FAILED

## What Changed

[Ne değiştiğinin özeti — 3-5 madde]

## Files Changed

| File | Change Type | Notes |
|------|------------|-------|
| [dosya] | created/modified/deleted | [not] |

## Verification

**Score:** [X]/[Y] truths verified
**TypeScript:** clean / errors
**Code Review:** passed / passed with notes / failed

## Future Delegation Notes

**Could Be Delegated:** yes/no
**Suggested Future Agent:** [registry/agents.md'den seç]
**Required Tools:** [registry/tools.md'den listele]
**Required Skills:** [registry/skills.md'den listele]
**Required Context:** [liste]
**Notes:** [implementation notları]

## Remaining Risks

- [Kapatılmayan risk varsa]

## Documentation Updated

- [ ] project-map/ → [hangi dosyalar]
- [ ] decisions/ → [yeni karar varsa]
- [ ] known-risks.md → [varsa]

## Memory Update Summary

- **Status:** [ran / skipped / no-memory-folder]
- **Durable learnings:** [öğrenilen kalıplar — yoksa "none"]
- **Updated memory files:** [güncellenen dosya listesi — yoksa "none"]
- **Project preferences:** [tespit edilen tercihler — yoksa "none"]
- **Recurring issues:** [tespit edilen sorunlar — yoksa "none"]
- **Agent performance notes:** [varsa]
- **Handoff note:** [kısa özet]
- **Next task hints:** [öneriler — yoksa "none"]

## Suggested Next Task

[Bir sonraki mantıklı adım — 1 cümle]
```

### Task Dosyasını Taşı

`tasks/active/YYYY-MM-DD-slug.md` → `tasks/completed/YYYY-MM-DD-slug.md`

Son olarak dosyaya şunu ekle:
```markdown
## Closed

**Closed:** [tarih]
**Report:** reports/YYYY-MM-DD-slug.md
```

## User-Facing Output

Kullanıcıya şu formatta göster:

```
## Dev Loop Complete ✓

Goal: [hedef]
Iterations: [sayı]
Verification: [X]/[Y] truths verified

Changes:
- [dosya]: [ne değişti]

All checks: TypeScript [✓/✗] | Code Review [✓/✗] | Visual QA [✓/N/A] | Security [✓/N/A] | Verification [✓/✗]

Memory updated: project-map [✓] | decisions [✓/N/A] | risks [✓/N/A]

Suggested next: [öneri]
```

## Checklist

- [ ] Hangi executor kullanıldı? (frontend / backend / single-claude)
- [ ] backend executor kullanıldıysa security-agent çalıştı mı?
- [ ] backend executor kullanıldıysa allowed_files dışına çıkılmadı mı?
- [ ] Executor Summary final raporda var mı?
- [ ] security_review_required: yes ise Security Summary var mı?
- [ ] reviewer-agent çalıştı mı? (Phase 3.5 tamamlandı mı?)
- [ ] security-agent gerekli miydi? (riskli alan değişti mi?)
- [ ] gerekliyse security-agent çalıştı mı? (Phase 3.7 tamamlandı mı?)
- [ ] Security Summary final raporda var mı?
- [ ] security changes_requested varsa düzeltildi mi?
- [ ] security blocked ise task close edilmedi mi?
- [ ] high/critical risk varsa human approval alındı mı?
- [ ] Review Summary final raporda var mı?
- [ ] changes_requested varsa düzeltme yapıldı mı?
- [ ] blocked ise task close edilmedi mi? (blocked task kapatılamaz)
- [ ] test-agent gerekli miydi? (kod değişikliği var mıydı?)
- [ ] gerekliyse test-agent çalıştı mı? (Phase 4.5 tamamlandı mı?)
- [ ] Test Summary final raporda var mı?
- [ ] commands run listesi var mı? (yoksa "none" olarak belirtildi mi?)
- [ ] missing tests raporlandı mı?
- [ ] test-agent blocked verdiyse task close edilmedi mi?
- [ ] test-agent changes_requested verdiyse açıkça raporlandı mı?
- [ ] memory-agent çalıştı mı? (Phase 6.7 tamamlandı mı?)
- [ ] Memory Update Summary final raporda var mı?
- [ ] Handoff note `.dev-loop/memory/handoff-notes.md` içinde güncellendi mi?
- [ ] Final rapor oluşturuldu mu?
- [ ] Active → completed taşındı mı?

## Rules

- Rapor olmadan task'ı kapatma
- Active → completed taşımayı unutma
- Suggested next task her zaman yaz (boş bırakma)
- Final rapor delegation-notes.schema.md formatında Future Delegation Notes içermeli
- Memory Update Summary her zaman final raporda bulunmalı (skipped ise nedeni yaz)

## Forbidden

- Hata varken SUCCESS yazmak
- Memory update atlandıysa Close'a geçmek
- Kullanıcıya rapor sunmadan sessizce bitmek
- memory-agent çalışmadan `Memory Update Summary: ran` yazmak
- reviewer `blocked` verdiğinde task'ı kapatmak
- security-agent `blocked` verdiğinde task'ı kapatmak
- high/critical güvenlik riski varsa human approval olmadan kapatmak
- Security Summary olmadan final rapor oluşturmak (frontend-only'de "skipped" kabul edilir)
- Review Summary olmadan final rapor oluşturmak