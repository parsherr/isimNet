# Protocol 01 — Start Task

**Triggers:** Her yeni `/dev-loop <hedef>` çağrısında
**Purpose:** Context yükle, hazır ol

## Input

- Kullanıcı hedefi (raw string)

## Steps

1. CLAUDE.md oku (proje stack ve kuralları)
2. `.dev-loop/context/` altındaki tüm dosyaları oku:
   - project-overview.md
   - tech-stack.md
   - coding-rules.md
   - known-risks.md
   - current-focus.md
3. `.dev-loop/project-map/` altındaki tüm dosyaları oku
4. `.dev-loop/state/current.md` oku
5. `.dev-loop/decisions/` klasörüne bak — son 3 kararı oku
6. Yüklenen context'i zihinsel olarak özetle
7. (Opsiyonel — yeni tool kullanılacaksa) `.dev-loop/registry/tools.md` ilgili kategorisini oku
8. (Opsiyonel — yeni skill tetiklenecekse) `.dev-loop/registry/skills.md` ilgili bölümünü oku

## Output

- Yüklenen context özeti (zihinde — dosyaya yazmaya gerek yok)
- `tasks/active/YYYY-MM-DD-<task-slug>.md` oluştur (boş, sadece başlık ve timestamp)
- Task dosyası formatı: `schemas/task.schema.md` standardını kullan

## Rules

- `.dev-loop/` klasörü yoksa: Protocol 01 durur, `dev-loop-init` çağrılır
- CLAUDE.md yoksa: Kullanıcıyı uyar ama devam et
- context/ dosyaları boşsa (şablon hali): Mevcut projeyi analiz ederek doldurmayı öner

## Forbidden

- Context okumadan planlama yapma
- `.dev-loop/` yokken sessizce devam etme