# Tool Registry

**Last Updated:** 2026-05-07
**Version:** 1.0

Her tool kategorisinin kullanım sınırları, izin seviyeleri ve loglama gereksinimleri.

---

## Approval Levels

| Level | Anlamı |
|-------|--------|
| auto | Otomatik — onay gerekmez |
| log-only | Otomatik ama loglanır |
| user-confirm | Kullanıcı onayı gerekir |
| blocked | Hiçbir koşulda kullanılamaz |

---

## Tool: filesystem

**Purpose:** Proje dosyalarını okuma, yazma, oluşturma, silme.

**Allowed Usage:**
- Dosya okuma: `auto`
- Dosya oluşturma (planda varsa): `auto`
- Dosya değiştirme (planda varsa): `auto`
- Dosya silme: `user-confirm`
- Klasör oluşturma: `auto`

**Forbidden Usage:**
- Plan dışı dosya değiştirme
- `.env`, `.secret`, credentials dosyalarını değiştirme

**Logging Requirements:** Tüm write/create/delete işlemlerini log dosyasına kaydet.

**Failure Behavior:** Hata durumunda task log'a yaz, işlemi durdur, Team Lead'e ilet.

---

## Tool: terminal

**Purpose:** Shell komutları çalıştırma.

**Approval Matrix:**

| Komut Tipi | Örnekler | Approval |
|-----------|---------|---------|
| Safe | `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test` | auto |
| Safe | `git status`, `git diff`, `git log` | auto |
| Safe | `ls`, `find`, `grep`, `curl` (read-only) | auto |
| Log-only | `mkdir`, `cp`, `mv` | log-only |
| User-confirm | `npm install`, `pnpm add`, `yarn add` | user-confirm |
| User-confirm | `pnpm migrate`, `prisma migrate` | user-confirm |
| User-confirm | `git commit`, `git push` | user-confirm |
| User-confirm | `vercel deploy`, `npm publish` | user-confirm |
| Blocked | `rm -rf` | blocked |
| Blocked | `DROP TABLE`, destructive DB komutları | blocked |
| Blocked | `chmod 777` | blocked |

**Unknown Commands:** Listede olmayan komutlar loglanmalı. Agent emin değilse kullanıcıya sor.

**Logging Requirements:** Her terminal komutu log dosyasına kaydet (komut + exit code + özet).

**Failure Behavior:** Non-zero exit code → hatayı logla → Team Lead'e ilet.

---

## Tool: git

**Purpose:** Versiyon kontrolü işlemleri.

**Allowed Usage:**
- `git status`, `git diff`, `git log`: `auto`
- `git add`, `git commit`: `user-confirm`
- `git push`, `git pull`: `user-confirm`
- `git checkout`, `git branch`: `user-confirm`

**Forbidden Usage:**
- `git push --force` (main/master branch'e)
- `git reset --hard` (kullanıcı onayı olmadan)
- `git clean -fd` (kullanıcı onayı olmadan)

**Logging Requirements:** Her git işlemi loglanır.

**Failure Behavior:** Conflict durumunda dur, kullanıcıya ilet.

---

## Tool: package-manager

**Purpose:** Dependency yönetimi (npm, pnpm, yarn).

**Allowed Usage:**
- `install` / `add`: `user-confirm`
- `remove` / `uninstall`: `user-confirm`
- `run <script>` (typecheck, lint, build, test): `auto`
- `run <script>` (deploy, publish, migrate): `user-confirm`
- `list`, `outdated`: `auto`

**Forbidden Usage:**
- Global install (`npm install -g`)

**Logging Requirements:** Her package-manager komutu loglanır.

**Failure Behavior:** Hata durumunda logla ve dur.

---

## Tool: test-runner

**Purpose:** Proje testlerini çalıştırma.

**Allowed Usage:**
- Unit testler: `auto`
- Integration testler: `auto`
- E2E testler: `user-confirm`

**Forbidden Usage:**
- Production veritabanına karşı test

**Logging Requirements:** Test sonuçları loglanır.

**Failure Behavior:** Başarısız testler raporlanır, task BLOCKED değil — verifier gözlemler.

---

## Tool: browser

**Purpose:** Web sayfası analizi, UI doğrulama.

**Allowed Usage:**
- Read-only page fetch: `auto`
- Screenshot alma: `auto` (screenshot tool varsa)
- Form submit, click: `user-confirm`

**Forbidden Usage:**
- Authentication ile production sistemlere giriş
- Ödeme akışları, kritik aksiyonlar

**Logging Requirements:** URL + status loglanır.

**Failure Behavior:** Erişilemeyen URL → Visual QA atlanır, loglanır.

---

## Tool: screenshot

**Purpose:** Dev server'ın görsel çıktısını almak.

**Allowed Usage:**
- `node scripts/screenshot.cjs <url> <slug>`: `auto` (dev server çalışıyorsa)

**Forbidden Usage:**
- Production URL'lerinden screenshot

**Prerequisites:**
- `scripts/screenshot.cjs` proje kökünde mevcut olmalı
- Dev server `http://localhost:3000` çalışıyor olmalı

**Logging Requirements:** Screenshot path ve success durumu loglanır.

**Failure Behavior:** Hata loglanır, o task için Visual QA atlanır, sistem devam eder.

---

## Tool: search

**Purpose:** Codebase içinde arama.

**Allowed Usage:**
- `grep`, `find`, `rg` (ripgrep): `auto`
- File content search: `auto`

**Logging Requirements:** Arama loglanmaz (read-only, low risk).

**Failure Behavior:** No matches → boş sonuç döndür.

---

## Tool: documentation-generator

**Purpose:** Proje dokümantasyonunu otomatik güncelleme.

**Allowed Usage:**
- `.dev-loop/project-map/*.md` güncelleme: `auto`
- `.dev-loop/context/*.md` güncelleme: `auto`
- `.dev-loop/decisions/*.md` oluşturma: `auto`

**Forbidden Usage:**
- CLAUDE.md değiştirme (kullanıcı onayı olmadan)
- README.md değiştirme (kullanıcı onayı olmadan)

**Logging Requirements:** Hangi dosyaların güncellendiği loglanır.

**Failure Behavior:** Başarısız güncelleme loglanır, Memory Update checklist'inde işaretlenmez.

---

## Adding New Tools

Yeni tool kategorisi eklemek için bu dosyaya yukarıdaki format ile yeni bölüm ekle.
Approval Matrix tablosunu güncelle ve ilgili agent'ların "Allowed Actions" listesini güncelle.