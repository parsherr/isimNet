# Protocol 10 — Documentation Bootstrap

**Version:** 1.0
**Added:** 2026-05-08

---

## Purpose

Projeyi baştan sona analiz edip `.dev-loop/` documentation alanlarını (project-map, context, memory) oluşturmak veya güncel tutmak. Team Lead / CEO agent'ın projeyi güvenle anlayabilmesi için gerekli bağlamı sağlar.

---

## When to Use

| Durum | Ne zaman |
|-------|---------|
| İlk bootstrap | `/dev-loop-init` sonrası — proje ilk kez AI agent tarafından belgeleniyor |
| Yeniden bootstrap | Proje büyük bir değişim geçirdiyse veya documentation stale ise |
| Documentation Health check | `/dev-loop-status` "stale docs" veya "missing docs" gösteriyorsa |

**Tetikleyici komut:** `/dev-loop-bootstrap-docs`

Normal task pipeline'ında bu protokol çalışmaz. Normal pipeline'da documentation-agent maintenance modunu (Protocol 07 uzantısı) kullanır.

---

## Inputs

| Input | Kaynak | Zorunlu |
|-------|--------|---------|
| `project_root` | `pwd` | Evet |
| CLAUDE.md | Proje kökü | Hayır (varsa okunur) |
| package.json | Proje kökü | Hayır (varsa okunur) |
| README.md | Proje kökü | Hayır (varsa okunur) |
| Mevcut `.dev-loop/` içeriği | Proje `.dev-loop/` | Hayır (varsa korunur) |

---

## Allowed Writes

```
${project_root}/.dev-loop/
├── project-map/          ← Tüm .md dosyaları
├── context/              ← Tüm .md dosyaları
├── memory/
│   ├── learned-patterns.md
│   ├── recurring-issues.md
│   ├── project-preferences.md
│   └── handoff-notes.md
├── schemas/              ← Yalnızca template'den kopyalama
└── reports/
    ├── project-documentation-bootstrap.md
    ├── documentation-health.md
    └── legacy-artifacts.md
```

## Forbidden Writes

- Source kod dosyaları (app/, components/, lib/, hooks/ vb.)
- package.json, config dosyaları, .env
- `.dev-loop/state/current.md` — Bootstrap state'i değiştirmez
- `.dev-loop/tasks/`, `plans/`, `verification/`
- `~/.claude/` global engine dosyaları
- `memory/agent-performance.md` — Task bazlı bilgi gerektirir

---

## Bootstrap Process

### Step 1 — Pre-flight
- `project_root` doğrula
- `.dev-loop/` yoksa auto-init
- Schema sync yap (template'den eksikleri kopyala)
- Mevcut documentation-health.md'yi oku (update mi, first-run mı?)

### Step 2 — Load Existing Documentation
- Mevcut project-map/ ve context/ dosyalarını oku
- Task history'yi not et (state/history.md)
- Memory dosyalarını oku

### Step 3 — Source Analysis (Read-Only)
- package.json, CLAUDE.md, README.md oku
- app/, components/, lib/, hooks/, app/api/ yapısını tara
- API route'ları ve Server Actions'ı analiz et
- Güvenlik mekanizmalarını incele
- `project_analysis` yapısını oluştur

### Step 4 — Write Project-Map (10 files)
Şu standardı uygula — her dosyada 9 bölüm:
`Purpose / Key Files / How It Works / Dependencies / Data Flow / Important Patterns / Risky Areas / Safe Change Rules / Agent Notes / Last Updated`

### Step 5 — Write Context (5 files)
Gerçek proje bilgisiyle doldur. Placeholder bırakma.

### Step 6 — Review Memory
Gerçekten yeni bir şey öğrenilmediyse ekleme yapma. Mevcut entryleri koru.

### Step 7 — Legacy Artifact Check
Root'taki yanlış konumlu dosyaları tespit et. Raporu yaz. Silme.

### Step 8 — Generate Reports
`documentation-health.md` ve `project-documentation-bootstrap.md` oluştur.

### Step 9 — User Report
Kullanıcıya özet rapor ver.

---

## Maintenance Process

Normal `/dev-loop <hedef>` akışında documentation-agent Phase 6.5'te çalışır (**maintenance mode**).

Maintenance mode'da:
1. Tüm projeyi tekrar taramaz
2. Sadece `changed_files` ve ilgili raporlara bakar
3. Etkilenen project-map ve context dosyalarını günceller
4. `documentation-health.md` → `Last documentation update` günceller
5. Gerekirse stale/missing docs listesine güncelleme yapar

---

## Documentation Health Process

`documentation-health.md` her bootstrap'ta yeniden oluşturulur.
Her maintenance task'ta `Last documentation update` alanı güncellenir.

**Bootstrap status değerleri:**
- `complete` — Tüm 10 project-map + 5 context dosyası mevcut ve dolu
- `partial` — Bazı dosyalar eksik veya placeholder'lı
- `missing` — Bootstrap hiç çalıştırılmamış

**Stale tanımı:** Son güncelleme 7 günden eski.

---

## Team Lead Readiness Criteria

Bir proje Team Lead için hazır sayılır ancak tüm bunlar sağlandığında:

- [x] `project-map/` tam (10/10 dosya, placeholder yok)
- [x] `context/` tam (5/5 dosya, placeholder yok)
- [x] `schemas/` tam (12/12 schema)
- [x] `memory/` başlatılmış (en az learned-patterns + handoff-notes)
- [x] `project_root` bug çözülmüş (her agent input'unda `project_root` var)
- [x] Open security risks belgelenmiş (known-risks.md)
- [x] State doğru (state/current.md → idle)

---

## Related

| Dosya | İlişki |
|-------|--------|
| `~/.claude/commands/dev-loop-bootstrap-docs.md` | Bu protokolü tetikleyen komut |
| `~/.claude/agents/dev-loop-documentation.md` | Bootstrap Mode A + Maintenance Mode B |
| `protocols/07-update-memory.md` | Maintenance mode'un base protokolü |
| `registry/skills.md` | documentation-bootstrap skill kaydı |