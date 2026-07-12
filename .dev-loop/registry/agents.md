# Agent Registry

**Last Updated:** 2026-05-07
**Version:** 1.0
**Status:** Documentation-only — not yet executable

---

## Current Execution Mode

**Mode:** single-claude-code

Claude Code şu anda tek bir oturumda çalışmaktadır. Gerçek multi-agent execution henüz aktif değildir.

Her task yine de agent-compatible formatta kaydedilmelidir:
- İlerideki agent dönüşümünü kolaylaştırmak
- Task'ların net input/output sınırlarının olmasını sağlamak
- Hangi işin hangi agent'a devredilebileceğini şimdiden belgelemek

---

## Registered Agents

### planner-agent

**Purpose:** Kullanıcı hedefini analiz eder, wave-based task planı oluşturur, bağımlılık grafiği çizer.

**Trigger:** `/dev-loop <hedef>` Phase 2 (Planning) ve re-plan durumunda.

**Inputs:**
- CLAUDE.md içeriği
- `.dev-loop/context/` dosyaları
- `.dev-loop/project-map/` dosyaları
- `.dev-loop/decisions/` aktif kararlar
- Request Understanding bloğu
- Gap YAML (re-plan ise)

**Outputs:**
- `.dev-loop/plans/YYYY-MM-DD-<task-slug>.md`

**Allowed Actions:**
- Dosya okuma (codebase exploration)
- Plan dosyası yazma

**Forbidden Actions:**
- Kod değiştirme
- Terminal komutları çalıştırma
- GSD araçları kullanma

**Required Context Files:**
- `.dev-loop/context/tech-stack.md`
- `.dev-loop/context/coding-rules.md`
- `.dev-loop/project-map/overview.md`
- `.dev-loop/decisions/` (aktif kararlar)

**Writes To:**
- `.dev-loop/plans/YYYY-MM-DD-<slug>.md`

**Notes for Future Implementation:**
- `dev-loop-planner.md` agent dosyası mevcut — bunu base olarak kullan
- Context dosyalarını full okumak yerine özetlenmiş input paketi al

---

### executor-agent

**Purpose:** Plan dosyasındaki tek bir task'ı uygular. Kod yazar, dosyaları değiştirir.

**Trigger:** Wave içindeki her task için Team Lead tarafından spawn edilir.

**Inputs:**
- Task detayı (ne yapılacak, hangi dosyalar)
- Proje stack bilgisi (tech-stack.md)
- İlgili project-map dosyası
- coding-rules.md
- İlgili decisions dosyaları

**Outputs:**
- Değiştirilen dosyalar
- Değişiklik özeti raporu

**Allowed Actions (genel):**
- Kod dosyası okuma ve değiştirme
- Yeni dosya oluşturma (plana uygunsa)

**Required Context Files:**
- `.dev-loop/context/tech-stack.md`
- `.dev-loop/context/coding-rules.md`
- İlgili `.dev-loop/project-map/` dosyası
- İlgili `.dev-loop/decisions/` dosyaları

**Writes To:**
- Proje dosyaları (plana göre)
- `.dev-loop/logs/YYYY-MM-DD-<slug>.md`

**Subtypes:**
- frontend-single-file — GERÇEK IMPLEMENTASYON TAMAMLANDI (2026-05-07)
- backend-single-file — GERÇEK IMPLEMENTASYON TAMAMLANDI (2026-05-07)
- config-change — gelecekte implement edilecek

**Allowed Actions (frontend-single-file):**
- Dosya okuma (sınırsız — context için)
- Edit tool — sadece planner'ın target_files listesindeki frontend dosyaları
- Write tool — sadece .dev-loop/logs/ altına

**Forbidden Actions (frontend-single-file):**
- app/api/, lib/actions/, lib/auth, middleware, database dosyalarına dokunma
- package.json ve lock dosyalarını değiştirme
- Dependency install (npm/pnpm/yarn add)
- Yeni component dosyası oluşturma (plan açıkça söylemedikçe)
- Mimari refactor, kendi kendine yeni task üretme, başka agent spawn etme, terminal komutları

**Allowed Actions (backend-single-file):**
- Read tool — context, task, plan, project-map, decisions (sınırsız)
- Edit tool — sadece planner'ın allowed_files listesindeki backend dosyaları
- Write tool — sadece .dev-loop/logs/ altına

**Forbidden Actions (backend-single-file):**
- Frontend dosyaları (components/, hooks/, lib/utils/)
- Auth core (lib/auth/, middleware.ts, session provider)
- Database schema/migration (prisma/, lib/db/)
- package.json, .env, secrets
- Dependency install, deploy/migration
- allowed_files dışında dosya değiştirme
- Bash tool, agent spawn

**Notes for Future Implementation:**
- frontend-single-file TAMAMLANDI (2026-05-07) — Agent: ~/.claude/agents/dev-loop-executor-frontend.md
- backend-single-file TAMAMLANDI (2026-05-07) — Agent: ~/.claude/agents/dev-loop-executor-backend.md
- Planner executor_routing bloğunda executor_type belirtir
- Backend executor her zaman security_review_required: yes — Phase 3.7 zorunlu
- Sonraki: config-change subtype

---

### reviewer-agent

**Purpose:** Executor'ın yaptığı değişiklikleri kod kalitesi açısından denetler.

**Trigger:** Her executor-agent tamamlandıktan hemen sonra.

**Inputs:**
- Değiştirilen dosyaların listesi ve içerikleri
- coding-rules.md
- Değişiklik özeti

**Outputs:**
- `.dev-loop/reports/reviews/YYYY-MM-DD-<slug>-<wave>-<task>.md`

**Allowed Actions:**
- Dosya okuma
- Review raporu yazma

**Forbidden Actions:**
- Kod değiştirme
- Minor issue için FAILED verme

**Required Context Files:**
- `.dev-loop/context/coding-rules.md`

**Writes To:**
- `.dev-loop/reports/reviews/YYYY-MM-DD-<slug>-<wave>-<task>.md`

**Notes for Future Implementation:**
- TypeScript/ESLint entegrasyonu ile otomatik kontrol eklenebilir

---

### verifier-agent

**Purpose:** Tüm task tamamlandıktan sonra hedefin gerçekten karşılanıp karşılanmadığını doğrular.

**Trigger:** Tüm wave'ler tamamlandıktan sonra Phase 4 (Verification).

**Inputs:**
- Task context (task_id, goal, success_criteria, changed_files, observable_truths)
- `plans/YYYY-MM-DD-slug.md`
- `logs/YYYY-MM-DD-slug.md`
- `schemas/agent-output.schema.md` (output format için)
- `schemas/module-simulation.schema.md` (simulation var mı kontrolü)

**Outputs:**
- `.dev-loop/verification/YYYY-MM-DD-<slug>.md`

**Allowed Actions:**
- Dosya okuma (Read tool) — sınırsız
- grep/find/bash — read-only komutlar
- pnpm typecheck — TypeScript kontrolü
- verification/ altına dosya yazma

**Forbidden Actions:**
- Proje kaynak dosyalarını değiştirme
- Kod düzeltme veya yorum ekleme
- Agent spawn etme
- .dev-loop/verification/ dışına yazma

**Required Context Files:**
- Plan dosyası, Log dosyası, Tüm değiştirilmiş dosyalar

**Writes To:**
- `.dev-loop/verification/YYYY-MM-DD-<slug>.md`
- `schemas/agent-output.schema.md` formatında agent output YAML

**Notes for Future Implementation:**
- GERÇEK IMPLEMENTASYON TAMAMLANDI (2026-05-07)
- dev-loop-verifier.md agent dosyası güncel ve kullanıma hazır
- agent-output.schema.md uyumlu output üretiyor
- Extended proses kontrolü aktif (Future Delegation Notes, Module Simulation Summary)
- Sonraki adım: executor-agent implementation

---

### documentation-agent

**Purpose:** Task tamamlandıktan sonra project-map dosyalarını günceller.
**Implementation Status:** GERÇEK IMPLEMENTASYON TAMAMLANDI (2026-05-07)
**Agent File:** ~/.claude/agents/dev-loop-documentation.md
**Trigger Point:** Phase 6 (Memory Update) sonrası, Phase 7 (Close Task) öncesi

**Inputs:**
- task_id, goal, changed_files, plan_file, final_report_file, verification_status

**Allowed Actions:**
- Read tool — .dev-loop/ altındaki tüm dosyalar (sınırsız)
- Read tool — proje kaynak dosyaları (context için, değiştirmeden)
- Edit tool — sadece .dev-loop/project-map/*.md
- Edit tool — sadece .dev-loop/context/known-risks.md ve context/current-focus.md
- Write tool — sadece .dev-loop/reports/ altına (documentation report)

**Forbidden Actions:**
- Proje kaynak dosyalarını değiştirme (components/, app/, lib/ vb.)
- .dev-loop/state/ dosyalarını değiştirme
- .dev-loop/tasks/, plans/, verification/ dosyalarını değiştirme
- Kod yazmak veya düzeltmek
- Agent spawn etme
- Terminal komutları çalıştırma

**Writes To:**
- `.dev-loop/project-map/*.md`
- `.dev-loop/context/known-risks.md`
- `.dev-loop/context/current-focus.md`
- `.dev-loop/reports/YYYY-MM-DD-slug-documentation.md`

**Notes for Future Implementation:**
- TAMAMLANDI (2026-05-07)
- verification_status: gaps_found ise çalışmaz
- Minimum değişiklik prensibi — sadece eksik bilgiyi ekle
- Mevcut içeriği silme veya overwrite etme

---

### reviewer-agent

**Purpose:** Executor veya single-Claude execution tarafından yapılan kod değişikliklerini kalite, pattern uyumu ve scope açısından incelemek.
**Implementation Status:** GERÇEK IMPLEMENTASYON TAMAMLANDI (2026-05-07)
**Agent File:** ~/.claude/agents/dev-loop-reviewer.md

**Trigger:** executor-agent veya single-Claude execution kod değişikliği yaptıktan hemen sonra, verifier-agent çalışmadan önce (Phase 3.5).

**Inputs:**
- Task file (task'ın hedefi ve scope'u)
- Plan file (target_files, success criteria)
- Log file (executor'ın yaptığı değişiklikler)
- Değişen kaynak dosyalar
- `.dev-loop/context/coding-rules.md`
- `.dev-loop/context/tech-stack.md`
- İlgili `.dev-loop/project-map/` dosyası

**Outputs:**
- `review-output.schema.md` uyumlu review raporu
- Approval kararı: approved / approved_with_notes / changes_requested / blocked

**Allowed Actions:**
- Read tool — değişen kaynak dosyalar (sınırsız)
- Read tool — `.dev-loop/tasks/`, `plans/`, `logs/`, `context/`, `project-map/`, `decisions/`
- Write tool — yalnızca `.dev-loop/reports/reviews/YYYY-MM-DD-<slug>.md`

**Forbidden Actions:**
- Kaynak kod değiştirme
- Auto-fix yapma
- Task status değiştirme
- Verification sonucunu değiştirme
- Memory/documentation dosyalarını değiştirme
- Bash tool kullanma
- Agent spawn etme

**Required Context Files:**
- `.dev-loop/context/coding-rules.md`
- `.dev-loop/context/tech-stack.md`
- İlgili `.dev-loop/project-map/` dosyası
- `schemas/review-output.schema.md`

**Writes To:**
- `.dev-loop/reports/reviews/YYYY-MM-DD-<task-slug>.md`

**Notes for Future Implementation:**
- TAMAMLANDI (2026-05-07)
- Max 2 review-fix döngüsü — 2. changes_requested'dan sonra verifier'a geçilir
- `blocked` → task ilerleyemez, kullanıcıya bildirilir
- Sadece dokümantasyon-only task'ta opsiyonel olarak atlanabilir
- Agent invocation: general-purpose + loaded instructions (native subagent type kayıtlı değil)

---

### security-agent

**Purpose:** Backend, API, auth veya server-side değişiklikleri güvenlik açısından incelemek.
**Implementation Status:** GERÇEK IMPLEMENTASYON TAMAMLANDI (2026-05-07)
**Agent File:** ~/.claude/agents/dev-loop-security.md

**Trigger:** reviewer-agent sonrası, verifier-agent öncesi — changed_files riskli alan içeriyorsa (Phase 3.7). Frontend-only tasklarda atlanır.

**Inputs:**
- Task file, plan file, log file
- Değişen kaynak dosyalar ve ilgili auth/session/db modülleri
- `.dev-loop/context/tech-stack.md`
- İlgili `.dev-loop/project-map/` dosyaları

**Outputs:**
- `security-output.schema.md` uyumlu security raporu
- Approval kararı: passed / passed_with_notes / changes_requested / blocked
- human_approval_required: true/false

**Allowed Actions:**
- Read tool — değişen kaynak dosyalar ve ilgili modüller (sınırsız)
- Read tool — `.dev-loop/tasks/`, `plans/`, `logs/`, `context/`, `project-map/`, `decisions/`
- Write tool — yalnızca `.dev-loop/reports/security/YYYY-MM-DD-<slug>.md`

**Forbidden Actions:**
- Kaynak kod değiştirme, auto-fix
- Task status, verification/memory/documentation dosyalarını değiştirme
- Bash tool, agent spawn, dependency install, deploy/migration

**Required Context Files:**
- `.dev-loop/context/tech-stack.md`
- `schemas/security-output.schema.md`

**Writes To:**
- `.dev-loop/reports/security/YYYY-MM-DD-<task-slug>.md`

**Security Scope Triggers:**
- `app/api/` — API endpoints
- `lib/actions/` — Server actions
- `lib/auth/`, `middleware.ts` — Auth/session
- `lib/db/`, `prisma/` — Database
- File upload/download logic, `package.json`, `.env*`

**Notes for Future Implementation:**
- TAMAMLANDI (2026-05-07)
- Max 2 security-fix döngüsü
- human_approval_required: true → high/critical risk, close-task öncesi onay gerekir
- Agent invocation: general-purpose + loaded instructions (native subagent type kayıtlı değil)

---

### qa-agent

**Purpose:** UI değişikliklerini görsel olarak doğrular.

**Trigger:** Frontend task tamamlandıktan sonra (sadece screenshot.cjs + dev server varsa).

**Allowed Actions:**
- Terminal: `node scripts/screenshot.cjs <url> <slug>`
- PNG dosyası okuma
- QA raporu yazma

**Forbidden Actions:**
- Dev server başlatma/durdurma
- Kod değiştirme

**Writes To:**
- Screenshot PNG
- `.dev-loop/reports/reviews/YYYY-MM-DD-<slug>-qa.md`

**Notes for Future Implementation:**
- Playwright/Puppeteer entegrasyonu ile güçlendirilebilir

---

### memory-agent

**Purpose:** Task sonunda oluşan artifact'lardan kalıcı proje hafızası çıkarmak.
**Implementation Status:** GERÇEK IMPLEMENTASYON TAMAMLANDI (2026-05-07)
**Agent File:** ~/.claude/agents/dev-loop-memory.md

**Trigger:** Verifier ve documentation-agent tamamlandıktan sonra, close task öncesi.

**Inputs:**
- Task file
- Plan file
- Final report
- Verification report
- Documentation report (opsiyonel)
- `.dev-loop/project-map/`
- `.dev-loop/context/`
- `.dev-loop/decisions/`
- `.dev-loop/logs/`

**Outputs:**
- Durable learnings
- Recurring issues
- Project preferences
- Agent performance notes
- Handoff notes
- Current focus update
- `schemas/memory-output.schema.md` uyumlu YAML özet

**Allowed Actions:**
- Read tool — tüm `.dev-loop/` alt dizinleri (okuma, sınırsız)
- Edit tool — sadece `.dev-loop/memory/*.md`
- Edit tool — sadece `.dev-loop/context/current-focus.md`

**Forbidden Actions:**
- Kaynak kod değiştirme
- Task status değiştirme
- Verification sonucunu değiştirme
- Terminal komutu çalıştırma
- Agent spawn etme
- Yeni task oluşturma
- `.dev-loop/tasks/`, `plans/`, `verification/`, `state/` değiştirme
- Write tool ile yeni dosya oluşturma

**Required Context Files:**
- `schemas/memory-output.schema.md`

**Writes To:**
- `.dev-loop/memory/learned-patterns.md`
- `.dev-loop/memory/recurring-issues.md`
- `.dev-loop/memory/project-preferences.md`
- `.dev-loop/memory/agent-performance.md`
- `.dev-loop/memory/handoff-notes.md`
- `.dev-loop/context/current-focus.md`

**Notes for Future Implementation:**
- TAMAMLANDI (2026-05-07)
- Pipeline entegrasyonu henüz yapılmadı — dev-loop.md Phase 6'ya eklenmesi bekliyor
- verification_status: gaps_found ise çalışmamalı (documentation-agent ile aynı kural)
- Boş güncelleme yapma — çıkarılacak bir şey yoksa dosyaya dokunma

---

### test-agent

**Purpose:** Task sonunda hangi test/check komutlarının gerekli olduğunu belirlemek, mevcut command outputlarını analiz etmek ve test raporu üretmek.
**Implementation Status:** GERÇEK IMPLEMENTASYON TAMAMLANDI (2026-05-07)
**Agent File:** ~/.claude/agents/dev-loop-test.md

**Trigger:** verifier-agent sonrası, documentation-agent öncesi (Phase 4.5 — henüz pipeline'a eklenmedi).

**Inputs:**
- Task file (task_id, goal, success_criteria)
- Plan file (changed_files, planlanan kontroller)
- Log file (executor'ın çalıştırdığı komutlar ve outputlar)
- `.dev-loop/context/tech-stack.md`
- `package.json` (mevcut test script'leri)
- `command_outputs` bloğu (ana akıştan gelen — opsiyonel)

**Outputs:**
- `test-output.schema.md` uyumlu test raporu
- Approval kararı: passed / passed_with_notes / changes_requested / blocked / skipped

**Allowed Actions:**
- Read tool — `.dev-loop/tasks/`, `plans/`, `logs/`, `reports/`, `verification/`, `context/`, `project-map/`
- Read tool — `package.json`, test config dosyaları
- Write tool — yalnızca `.dev-loop/reports/tests/YYYY-MM-DD-<slug>.md`

**Forbidden Actions:**
- Kaynak kod değiştirme
- Test dosyası yazma veya değiştirme
- Auto-fix yapma
- package.json değiştirme
- Dependency install, migration, deploy, publish
- Task status değiştirme
- Verification / memory / documentation dosyalarını değiştirme
- Bash tool kullanma
- Agent spawn etme

**Required Context Files:**
- `.dev-loop/context/tech-stack.md`
- `schemas/test-output.schema.md`

**Writes To:**
- `.dev-loop/reports/tests/YYYY-MM-DD-<task-slug>.md`

**Notes for Future Implementation:**
- v1: komut çalıştırmaz — sadece ana akıştan gelen outputları analiz eder
- v2: Bash read-only komutları (typecheck, lint) kendi çalıştırabilir
- command_outputs boşsa suggested_checks + missing_tests üretir, confidence: low
- Pipeline entegrasyonu henüz yapılmadı — dev-loop.md Phase 4.5 olarak eklenecek
- Max döngü: 1 (reviewer ve security'nin aksine re-run döngüsü yok)

---

---

### team-lead-agent

**Purpose:** Büyük hedefleri küçük, güvenli, dev-loop task'larına bölmek. Orchestration layer başlangıcı.

**Implementation Status:** PLANNING ONLY — v0.1 (2026-05-08)
**Command:** `/dev-loop-lead "<büyük hedef>"`
**Protocol:** `protocols/11-team-lead-planning.md`
**Schema:** `schemas/team-lead-plan.schema.md`

**Trigger:** Kullanıcı büyük/belirsiz bir hedef verdiğinde, çok dosyalı veya security-sensitive değişiklik gerektiğinde.

**Inputs:**
- Kullanıcı hedefi (serbest metin)
- `project_root` (pwd)
- `.dev-loop/context/` tüm dosyalar
- `.dev-loop/project-map/` tüm dosyalar
- `.dev-loop/memory/` (opsiyonel — kalıp ve tercihler için)
- `.dev-loop/reports/documentation-health.md`

**Outputs:**
- `.dev-loop/team-lead/plans/YYYY-MM-DD-<slug>.md`

**Allowed Actions:**
- Dosya okuma (Read tool) — sınırsız
- Bash tool — yalnızca `pwd`, `ls`, `test -f`, `test -d`
- Write tool — yalnızca `.dev-loop/team-lead/plans/` altına

**Forbidden Actions:**
- Kod değiştirmek (app/, components/, lib/ vb.)
- `/dev-loop <task>` çalıştırmak veya dispatch etmek
- Terminal komutları çalıştırmak (pwd/ls/test dışında)
- Worker başlatmak
- Source dosya yazmak
- Agent spawn etmek
- `.dev-loop/state/`, `.dev-loop/tasks/`, `.dev-loop/plans/` altına yazmak
- `~/.claude/.dev-loop/` altına yazmak

**Writes To:**
- `.dev-loop/team-lead/plans/YYYY-MM-DD-<slug>.md`

**v0.1 Limitations:**
- Plan üretir, dispatch etmez
- Human approval gerektiren noktaları işaretler ama beklemez
- Paralel execution desteği yok

**Future Versions:**
- v0.2: Onaylanan planı sırayla `/dev-loop` dispatch eder
- v0.3: Paralel worker terminal desteği
- v1.0: Tam CEO orchestration

**Notes:**
- Team Lead v0.1 yeni bir worker layer değil — orchestration layer başlangıcı
- Plan `status: draft` olarak üretilir — kullanıcı `status: approved` diyerek onaylar
- Her task için `dev_loop_prompt` alanı hazır prompt içerir — kullanıcı kopyalayıp çalıştırabilir

---

## Adding New Agents

Yeni agent eklemek için bu dosyaya yukarıdaki format ile yeni bölüm ekle. Ardından:
1. `~/.claude/agents/<agent-name>.md` dosyasını oluştur
2. İlgili command dosyasına trigger ekle
3. `schemas/agent-output.schema.md` formatında output üretmesini sağla