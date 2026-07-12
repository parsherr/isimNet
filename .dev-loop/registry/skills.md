# Skill Registry

**Last Updated:** 2026-05-07
**Version:** 1.0
**Status:** Documentation-only — procedures, not yet executable scripts

---

## Registered Skills

### request-understanding

**Purpose:** Kullanıcı isteğini analiz edip yapılandırılmış formata dönüştürme.

**Trigger:** Her yeni task başlangıcında (Protocol 02)

**Inputs:**
- Ham kullanıcı isteği
- CLAUDE.md içeriği
- `.dev-loop/context/` dosyaları

**Procedure Summary:**
1. İsteği oku
2. Goal, Scope, Out of Scope, Success Criteria, Affected Areas belirle
3. Belirsizlikleri tespit et
4. Kritikse soru sor (max 2), değilse varsayım yap
5. Request Understanding bloğunu yaz

**Outputs:** `## Request Understanding` bloğu

**Files Written:** `.dev-loop/tasks/active/YYYY-MM-DD-slug.md`

**Related Protocols:** `protocols/02-understand-request.md`
**Related Tools:** filesystem

---

### task-planner

**Purpose:** Wave-based, bağımlılık grafikli görev planı oluşturma.

**Trigger:** Phase 2 (Planning)

**Inputs:**
- Request Understanding bloğu
- Codebase context, decisions/

**Procedure Summary:**
1. Etkilenecek dosyaları oku
2. decisions/ ile çakışma kontrolü
3. Wave yapısını belirle
4. Observable truths ve risk listesi oluştur
5. Plan dosyasını yaz

**Files Written:** `.dev-loop/plans/YYYY-MM-DD-slug.md`

**Related Protocols:** `protocols/03-plan-task.md`
**Related Agents:** planner-agent

---

### task-executor

**Purpose:** Tek bir plan task'ını uygulama.

**Trigger:** Her wave task'ı için

**Procedure Summary:**
1. İlgili project-map dosyasını oku
2. Değiştirilecek dosyaları oku
3. decisions/ geçmişini kontrol et
4. Değişikliği yap
5. Log dosyasını güncelle

**Related Protocols:** `protocols/04-execute-task.md`
**Related Agents:** executor-agent

---

### code-reviewer

**Purpose:** Kod değişikliklerinin kalitesini denetleme.

**Trigger:** Her executor tamamlandıktan sonra

**Procedure Summary:**
1. Değiştirilen dosyaları oku
2. TypeScript/ESLint, mantık hatası, pattern uyumu kontrol et
3. Review raporunu yaz (PASSED/FAILED)

**Files Written:** `.dev-loop/reports/reviews/*.md`

**Related Protocols:** `protocols/05-review-task.md`
**Related Agents:** reviewer-agent

---

### task-verifier

**Purpose:** Task'ın hedefi gerçekten karşılayıp karşılamadığını doğrulama.

**Trigger:** Tüm wave'ler tamamlandıktan sonra

**Procedure Summary:**
1. 4 seviye kod kontrolü (Artifact → Implementation → Connected → Data Flow)
2. Anti-pattern taraması
3. Proses kontrolü
4. Observable truths doğrula
5. Verification raporunu yaz

**Files Written:** `.dev-loop/verification/YYYY-MM-DD-<slug>.md`

**Related Protocols:** `protocols/06-verify-task.md`
**Related Agents:** verifier-agent

---

### memory-updater

**Purpose:** Task sonrası tüm hafıza dosyalarını güncelleme.

**Trigger:** Verification PASSED sonrasında

**Procedure Summary:**
1. Etkilenen project-map dosyalarını güncelle
2. Yeni karar varsa decisions/ oluştur
3. known-risks, current-focus, state dosyalarını güncelle
4. Future Delegation Notes hazırla

**Related Protocols:** `protocols/07-update-memory.md`
**Related Agents:** memory-agent

---

### final-reporter

**Purpose:** Task kapanışında final rapor oluşturma.

**Trigger:** Protocol 08 (Close Task)

**Procedure Summary:**
1. Final raporu oluştur
2. Future Delegation Notes bölümünü doldur
3. Task dosyasını active → completed taşı
4. Kullanıcıya raporu sun

**Files Written:**
- `.dev-loop/reports/YYYY-MM-DD-<slug>.md`
- `.dev-loop/tasks/completed/YYYY-MM-DD-<slug>.md`

**Related Protocols:** `protocols/08-close-task.md`

---

### security-review

**Purpose:** Backend/API değişikliklerinde güvenlik açığı tarama.

**Trigger:** Backend task tamamlandıktan sonra

**Procedure Summary:**
1. Path traversal, XSS, SSRF, hardcoded secret, auth bypass kontrolü
2. Security raporunu yaz

**Related Agents:** security-agent
**Related Tools:** filesystem, search

---

### visual-qa

**Purpose:** UI değişikliklerini görsel olarak doğrulama.

**Trigger:** Frontend task + screenshot.cjs + dev server varsa

**Procedure Summary:**
1. `node scripts/screenshot.cjs <url> <slug>` çalıştır
2. PNG'yi oku ve analiz et
3. QA raporunu yaz

**Related Agents:** qa-agent
**Related Tools:** screenshot, browser

---

### project-documentation-updater

**Purpose:** Task sonrası proje hafıza dosyalarını güncelleme.

**Trigger:** Protocol 07

**Procedure Summary:**
1. Plan'daki "Affected Project-Map Files" listesini oku
2. Her etkilenen project-map dosyasını güncelle
3. State dosyalarını güncelle

**Related Protocols:** `protocols/07-update-memory.md`
**Related Tools:** filesystem, documentation-generator

---

### test-runner

**Purpose:** Proje test suite'ini çalıştırma.

**Trigger:** Task tamamlandıktan sonra (test framework varsa)

**Procedure Summary:**
1. Test komutunu çalıştır
2. Başarısız testleri listele
3. Sonuçları raporla

**Notes:** Test framework yoksa bu skill atlanır.

---

---

### documentation-bootstrap

**Purpose:** Projeyi Team Lead / CEO agent için okunabilir ve güvenli hale getirir. Kaynak kodu baştan sona analiz eder, `.dev-loop/project-map/` ve `.dev-loop/context/` dosyalarını gerçek proje bilgisiyle doldurur. Team Lead orchestration'dan önce çalıştırılması zorunlu capability.

**Trigger:** `/dev-loop-bootstrap-docs` komutu ile manuel tetiklenir. `/dev-loop-init` sonrasında önerilir ama otomatik çalışmaz.

**Inputs:**
- `project_root` (pwd)
- `package.json`, `CLAUDE.md`, `README.md` (varsa)
- `app/`, `components/`, `lib/`, `hooks/`, `app/api/` (read-only tarama)
- Mevcut `.dev-loop/` içeriği (varsa korunur)

**Procedure Summary:**
1. Pre-flight — project_root doğrula, schema sync
2. Mevcut documentation yükle (overwrite için)
3. Proje kaynak analizini yap (read-only)
4. 10 project-map dosyası oluştur/güncelle (standart 9-bölüm format)
5. 5 context dosyası oluştur/güncelle
6. Memory gözden geçir (gerçek yeni bilgi varsa ekle)
7. Legacy artifact kontrolü
8. documentation-health.md oluştur/güncelle
9. project-documentation-bootstrap.md oluştur/güncelle
10. Kullanıcıya özet rapor ver

**Outputs:**
- `.dev-loop/project-map/` — 10 dosya (overview, architecture, frontend, backend, api, database, components, routes, security, file-index)
- `.dev-loop/context/` — 5 dosya (project-overview, tech-stack, coding-rules, known-risks, current-focus)
- `.dev-loop/reports/documentation-health.md`
- `.dev-loop/reports/project-documentation-bootstrap.md`

**Related Protocols:** `protocols/10-documentation-bootstrap.md`
**Related Agents:** `dev-loop-documentation` (Mode A — bootstrap)
**Related Commands:** `~/.claude/commands/dev-loop-bootstrap-docs.md`

**Writes to:**
- `.dev-loop/project-map/*.md`
- `.dev-loop/context/*.md`
- `.dev-loop/memory/` (kısıtlı — gerçek yeni bilgi varsa)
- `.dev-loop/reports/documentation-health.md`
- `.dev-loop/reports/project-documentation-bootstrap.md`
- `.dev-loop/schemas/` (template'den eksik schema kopyalama)

**Does NOT write to:**
- Source kod dosyaları
- `package.json`, config dosyaları, `.env`
- `.dev-loop/state/current.md`
- `.dev-loop/tasks/`, `plans/`, `verification/`
- `~/.claude/.dev-loop/` (global engine)

**Future Executable Version Notes:**
Bu skill şu an documentation-agent (Mode A) tarafından execute edilir. İleride Team Lead sisteminde:
- CEO agent bootstrap durumunu `documentation-health.md`'den okur
- Readiness `partial` veya `missing` ise worker terminal'e bootstrap task'ı atar
- Bootstrap tamamlanmadan diğer task'ları dispatch etmez

---

## Adding New Skills

Yeni skill eklemek için bu dosyaya yukarıdaki format ile yeni bölüm ekle.