# Protocol 09 — Module Simulation

**Triggers:** Phase 2.5 (Planning ile Execution arasında — opsiyonel)
**Purpose:** Task için hangi future agent/tool/skill'lerin kullanılacağını simüle et, kayıt altına al

---

## When to Use

Bu protokolü çalıştır:
- Yeni bir task türü ilk kez yapılıyorsa
- Karmaşık, çok adımlı bir task ise
- registry'de tanımlı bir agent'a ileride devredilebilecek adımlar içeriyorsa
- Task başlamadan "bu ne kadar otomatize edilebilir?" sorusuna cevap aranıyorsa

Bu protokolü atla:
- Çok basit tek adımlı task ise (tek dosya, 5 satırdan az değişiklik)
- Aynı task türü daha önce simüle edildiyse ve değişiklik yoksa

---

## Inputs

- Plan dosyası (`plans/YYYY-MM-DD-slug.md`)
- Request Understanding bloğu (task dosyasından)
- `.dev-loop/registry/agents.md`
- `.dev-loop/registry/tools.md`
- `.dev-loop/registry/skills.md`
- `.dev-loop/schemas/module-simulation.schema.md`

---

## Process

### Adım 1 — Agent Mapping

Plan'daki her wave task'ı için:
1. registry/agents.md'den en uygun agent'ı seç
2. Bu agent'ın Inputs listesini kontrol et — task için gerekli input'lar hazır mı?
3. Bu agent'ın Forbidden Actions listesine bak — kısıt var mı?
4. "Delegatable: yes/no/partial" kararını ver

### Adım 2 — Tool Mapping

Task'ta kullanılacak her araç için:
1. registry/tools.md'den kategoriyi bul
2. Approval level'ı not et (auto / log-only / user-confirm / blocked)
3. Risky tool var mı? (user-confirm veya blocked)
4. Human approval points listesini oluştur

### Adım 3 — Skill Mapping

Task akışındaki her prosedür adımı için:
1. registry/skills.md'den en uygun skill'i bul
2. Skill'in "Procedure Summary" adımlarıyla task adımlarını eşleştir
3. Skill coverage'ı hesapla (kaç adım skill ile karşılanıyor?)

### Adım 4 — Input/Output Package Tasarımı

Her simüle edilen modül için:
1. Input paketi: Bu modüle geçilecek bilgiler neler?
2. Expected output: Bu modül ne döndürmeli?
3. Single-Claude mapping: Claude Code bu modül yokken ne yapıyor?

### Adım 5 — Simulation Dosyasını Yaz

`simulations/YYYY-MM-DD-slug.md` dosyasını `schemas/module-simulation.schema.md` formatında yaz.

---

## Outputs

- `simulations/YYYY-MM-DD-<task-slug>.md`

---

## Required Files

- `registry/agents.md` — agent tanımları
- `registry/tools.md` — tool approval levels
- `registry/skills.md` — skill prosedürleri
- `schemas/module-simulation.schema.md` — output formatı

---

## Logging Rules

Simulation dosyası oluşturulunca log'a şu notu ekle:
```
Module simulation completed: simulations/YYYY-MM-DD-slug.md
Simulated agents: [liste]
Simulated tools: [liste]
Simulated skills: [liste]
```

---

## Failure Behavior

- registry dosyaları yoksa: simulation atlanır, log'a "registry not found — simulation skipped" yaz
- Plan dosyası yoksa: simulation yapılamaz, dur
- Schema dosyası yoksa: serbest format kullan ama uyar

---

## Rules

- Simulation gerçek agent spawn etmez
- Simulation gerçek tool çalıştırmaz
- Simulation sadece belgeleme ve analiz amaçlıdır
- Her task için simulation zorunlu değil — protokol opsiyoneldir
- Simulation sonucu final report'a taşınır (Module Simulation Summary bölümü)

## Forbidden

- Simulation sonucunda agent spawn etme
- "Simülasyon tamamlandı, şimdi gerçeği yapayım" diyerek gerçek execution başlatma
- Simulation'ı execution olarak sunma