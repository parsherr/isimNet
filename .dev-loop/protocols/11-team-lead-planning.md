# Protocol 11 — Team Lead Planning

**Version:** 1.0
**Added:** 2026-05-08
**Status:** Active — v0.1 Planning Only

---

## Purpose

Büyük kullanıcı hedeflerini analiz edip güvenli, uygulanabilir dev-loop task'larına bölmek. Team Lead orchestration layer'ının planlama protokolüdür.

Bu protokol v0.1'de yalnızca plan üretir — task dispatch etmez.

---

## When to Use

| Durum | Ne zaman |
|-------|---------|
| Büyük/belirsiz hedef | "Files API güvenliğini düzelt", "Task sistemini iyileştir" |
| Çok dosyalı değişiklik | 3+ dosya etkilenecek |
| Security-sensitive alan | Backend, API, auth değişikliği |
| Human approval gerekli | Risk yüksek veya mimari karar var |
| Bağımlı task dizisi | Task'lar birbirini bekliyor |

**Tetikleyici komut:** `/dev-loop-lead "<büyük hedef>"`

Normal tek dosyalık değişiklikler için bu protokol gerekmez — direkt `/dev-loop` kullan.

---

## Inputs

| Input | Kaynak | Zorunlu |
|-------|--------|---------|
| `project_root` | `pwd` | Evet |
| Kullanıcı hedefi | Komut argümanı | Evet |
| CLAUDE.md | Proje kökü | Hayır |
| `.dev-loop/context/` | Proje .dev-loop/ | Evet |
| `.dev-loop/project-map/` | Proje .dev-loop/ | Evet |
| `.dev-loop/memory/` | Proje .dev-loop/ | Hayır |
| `.dev-loop/reports/documentation-health.md` | Proje .dev-loop/ | Hayır |

---

## Required Docs

Plan kalitesi için şu dosyalar okunmalı:
- `context/known-risks.md` — mevcut riskler
- `project-map/security.md` — güvenlik mekanizmaları
- `project-map/api.md` — API yapısı
- `project-map/backend.md` — server-side yapı
- `project-map/frontend.md` — UI yapısı
- `memory/learned-patterns.md` — geçmiş öğrenimler
- `memory/recurring-issues.md` — tekrar eden sorunlar

---

## Planning Process

### Step 1 — Goal Analysis
- Kullanıcının gerçek amacını anla (yüzeysel talep ≠ gerçek amaç)
- Etkilenen alanları belirle
- Risk seviyesini değerlendir

### Step 2 — Context Loading
- Tüm required docs'u paralel oku
- Mevcut known-risks'i yükle
- Memory patterns'ı incele

### Step 3 — Task Decomposition
- Her task max 1-2 dosya
- executor_type belirle (frontend / backend / single-claude / human-required)
- Bağımlılık grafiğini çiz
- Paralel çalışabilecekleri işaretle

### Step 4 — Pipeline Assignment
- Frontend task → security-agent skip
- Backend/API task → security-agent required
- Human-required task → pause before execution

### Step 5 — Risk & Approval Mapping
- Risk yüksek → human_approval_required: true
- Auth/middleware/DB → her zaman human-required
- Clarifying questions tespit et (planı bloklamaz)

### Step 6 — Plan Output
- `schemas/team-lead-plan.schema.md` formatında yaz
- `${project_root}/.dev-loop/team-lead/plans/YYYY-MM-DD-<slug>.md`
- Kullanıcıya özet sun + execution instructions

---

## Task Decomposition Rules

| Kural | Detay |
|-------|-------|
| Max dosya | Her task max 1-2 dosya — fazlaysa böl |
| Atomik | Tek mantıksal değişiklik |
| Bağımlılık explicit | Depends on açıkça belirtilmeli |
| Executor uyumu | Dosya tipiyle executor tipi eşleşmeli |
| Security trigger | Backend dosyası → security-agent zorunlu |
| Human trigger | Auth/DB/migration → human-required |

---

## Agent Selection Rules

| Executor Type | Koşul | Security |
|--------------|-------|---------|
| `frontend-single-file` | components/, app/(routes)/, hooks/, lib/utils/ | skip |
| `backend-single-file` | app/api/, lib/actions/, lib/server/ | required |
| `single-claude` | Read-only analysis, documentation-only | not applicable |
| `human-required` | lib/auth/, middleware.ts, prisma/, package.json | required |

---

## Risk Rules

| Risk | Aksiyon |
|------|---------|
| critical | Planı immediately flag et, human-required task yap |
| high | human_approval_required: true, execution öncesi dur |
| medium | Not olarak ekle, execution devam eder |
| low | Dokümante et, devam et |

---

## Human Approval Rules

Human approval gereken durumlar:
- Auth core değişikliği (lib/auth/, middleware)
- Database schema/migration
- Security-agent `blocked` kararı
- Risk seviyesi high veya critical
- Mimari karar gerekiyor (Team Lead emin değil)
- Kullanıcı açıkça onay istedi

Human approval noktasında:
- Task planı dur
- Kullanıcıya ne onaylaması gerektiğini açıkla
- Onay gelene kadar execution başlamaz

---

## Output Format

`schemas/team-lead-plan.schema.md` formatında plan dosyası.

Kullanıcıya şu bölümler sunulur:
- Goal interpretation
- Assumptions + clarifying questions
- Risk summary
- Task breakdown tablosu (executor type, pipeline, files, approval)
- Human approval points
- Execution order
- Dev-loop prompts (her task için hazır prompt)

---

## Forbidden Actions

- Proje kaynak dosyalarını değiştirme
- `/dev-loop <task>` çalıştırma veya dispatch etme
- Agent spawn etme
- Worker terminal başlatma
- `.dev-loop/state/`, `.dev-loop/tasks/`, `.dev-loop/plans/` altına yazma
- `~/.claude/.dev-loop/` altına yazmak
- Terminal komutları (pwd, ls, test -f dışında)

---

## Related

| Dosya | İlişki |
|-------|--------|
| `~/.claude/commands/dev-loop-lead.md` | Bu protokolü tetikleyen komut |
| `schemas/team-lead-plan.schema.md` | Plan output format |
| `protocols/10-documentation-bootstrap.md` | Team Lead öncesi bootstrap |
| `templates/dev-loop-init/team-lead/` | Klasör yapısı template |