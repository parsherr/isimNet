# Protocol 07 — Update Memory

**Triggers:** Verification PASSED sonrasında (gaps_found ise iterasyona devam)
**Purpose:** Tamamlanan task sonrası proje hafızasını güncelle

## Input

- Verification raporu
- Log dosyası
- Değiştirilen dosyaların listesi

## Mandatory Checklist

Bu adımları atlama. Tamamlanmadan task "complete" sayılmaz.

### 1. Project-Map Güncelle

Plan dosyasındaki "Affected Project-Map Files" listesine bak.
Her etkilenen dosyayı güncelle:
- Yeni component/route eklendiyse → ilgili project-map dosyasına ekle
- Mevcut yapı değiştiyse → güncel halini yaz
- `Last Updated` tarihini güncelle

### 2. Decisions Kaydet (Gerekiyorsa)

Şu durumlarda `decisions/YYYY-MM-DD-<karar-slug>.md` oluştur:
- Mimari bir tercih yapıldıysa (örn. "state'i client-side tuttuk")
- Alternatif yaklaşımlar arasında bilinçli seçim yapıldıysa
- Gelecekte çakışabilecek bir karar alındıysa

decisions/TEMPLATE.md formatını kullan.

### 3. Known Risks Güncelle

`context/known-risks.md`:
- Yeni risk tespit edildiyse ekle
- Çözülen risk varsa "Resolved" tablosuna taşı

### 4. Current Focus Güncelle

`context/current-focus.md`:
- Active task alanını temizle (tamamlandı)
- Next planned task'ı güncelle (varsa)
- In-progress files listesini temizle

### 5. State Güncelle

`state/current.md`:
- STATUS: idle (veya bir sonraki task varsa: planning)
- ACTIVE_TASK: none
- COMPLETED_TASKS listesine ekle
- GAPS listesini temizle
- LAST_UPDATED: [tarih]

### 6. History Ekle

`state/history.md`:
- Yeni satır ekle: `| [tarih] | [task adı] | completed | [dosya sayısı] dosya |`

### 7. Future Delegation Notes Hazırla

Task raporunda `## Future Delegation Notes` bölümünü doldur:
- `schemas/delegation-notes.schema.md` formatını kullan
- registry/agents.md'den "Suggested Future Agent" seç
- registry/tools.md'den "Required Tools" listele
- registry/skills.md'den "Required Skills" listele
- Bu bölüm şimdilik sadece dokümantasyon — hiçbir agent spawn edilmez

## Output

Tüm checklist ✓ olduğunda Protocol 08'e geç.

## Rules

- Bu protokolü atlama — hafıza güncellenmezse sistem zamanla körleşir
- Her maddeyi gerçekten güncelle (boş geçme)
- Tarih formatı: YYYY-MM-DD

## Forbidden

- Memory update yapmadan Protocol 08'e geçme
- "Değişen bir şey yok" diyerek atlama (her task bir şeyler değiştirir)