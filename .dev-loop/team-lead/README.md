# Team Lead — Planning Directory

**Version:** v0.1 (Planning Only)
**Status:** Active

---

## Purpose

Bu klasör Team Lead / CEO agent'ın orchestration artifact'larını tutar.

Team Lead v0.1 yalnızca planlama yapar:
- Büyük hedefleri analiz eder
- Küçük dev-loop task'larına böler
- Her task için executor, pipeline, dosya sınırları belirler
- Human approval noktaları işaretler
- Planı kullanıcıya sunar — çalıştırmaz

---

## Directory Structure

```
team-lead/
├── plans/          ← Team Lead plan dosyaları (YYYY-MM-DD-<slug>.md)
├── decisions/      ← Team Lead seviyesinde mimari kararlar
└── handoffs/       ← Oturumlar arası bağlam aktarımı
```

---

## Usage

```
/dev-loop-lead "<büyük hedef>"
```

Plan çıktısı: `team-lead/plans/YYYY-MM-DD-<slug>.md`

Plan onaylandıktan sonra her task manuel olarak `/dev-loop <task>` ile çalıştırılır.

---

## v0.1 Limitations

- Plan üretir, task dispatch etmez
- Kodu değiştirmez
- Worker terminal başlatmaz
- Human approval gerektirir

## Future Versions

- v0.2: Onaylanan planı sırayla `/dev-loop` dispatch eder
- v0.3: Paralel worker terminal desteği
- v1.0: Tam CEO orchestration