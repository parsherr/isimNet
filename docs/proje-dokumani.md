# İşimNet – Mobil Cari Takip ve Satış Yönetimi Uygulaması

### Proje Dokümanı (v1.0)

---

# Projenin Amacı

İşimNet, küçük ve orta ölçekli işletmeler için geliştirilen, müşteri cari hesaplarını ve ürün stoklarını tek uygulama üzerinden yönetmeyi sağlayan modern bir mobil uygulamadır.

Uygulamanın temel amacı;

* Cari hesap takibini kolaylaştırmak,
* Borçlu satışları yönetmek,
* Stokları otomatik güncellemek,
* Tahsilatları kayıt altında tutmak,
* İşletmenin genel durumunu raporlamak,
* Tüm verileri cihazlar arasında senkronize edebilmektir.

Tasarım dili sade, modern ve tek elle kullanılabilecek şekilde hazırlanacaktır.

---

# Ana Sayfa

Uygulama açıldığında kullanıcıyı sade bir ana ekran karşılar.

Ana ekranda yalnızca temel modüller bulunacaktır.

* 👥 Müşteri Listesi
* 📦 Ürün Listesi
* 📊 Raporlar / İstatistikler

Her kart ilgili sayfaya yönlendirir.

Sağ alt köşede uygulamanın genel **Floating Action Button (+)** butonu bulunacaktır.

Bu buton üzerinden bulunulan sayfaya göre yeni kayıt oluşturulur.

Örneğin;

Müşteri sayfasındaysa;

> Yeni Müşteri

Ürün sayfasındaysa;

> Yeni Ürün

Detay sayfasındaysa;

> Yeni Satış

---

# Ürün Yönetimi

## Ürün Listesi

Her ürün kartında;

* Ürün Adı
* Stok Adedi
* Liste Satış Fiyatı

gösterilir.

Arama kutusu bulunacaktır.

Ürünlere tıklanınca detay ekranı açılır.

---

## Yeni Ürün Oluşturma

Alanlar;

* Ürün Adı
* Açıklama
* Satış Fiyatı
* Stok Adedi

Ürün bazında KDV tutulmaz.

Çünkü KDV satış sırasında belirlenecektir.

---

## Ürün Düzenleme

Ürün;

* düzenlenebilir
* silinebilir

---

# Ürün İstatistikleri

Ürün sayfasının üst kısmında özet kartı bulunacaktır.

Kart içerisinde;

**Toplam Mal Varlığı**

hesaplanacaktır.

Formül;

```
Ürün Fiyatı × Stok
```

Tüm ürünlerin toplamı gösterilir.

Örnek;

```
Laptop
10 x 25.000

=

250.000 TL
```

Altında

```
Toplam Stok Adedi
```

de gösterilebilir.

---

# Müşteri Yönetimi

## Müşteri Listesi

Üst tarafta Search Bar bulunacaktır.

Kartlarda;

* Ad Soyad
* Güncel Borç

gösterilecektir.

Örneğin;

```
Ahmet Yılmaz

Borç:
8.450 TL
```

Müşteriye tıklanınca detay sayfası açılır.

---

# Müşteri Detay Sayfası

Bu ekran uygulamanın en önemli ekranıdır.

Üst tarafta müşteri bilgileri yer alır.

Altında istatistik kartları bulunur.

Gösterilecek bilgiler;

### Toplam Ciro

Müşteriye bugüne kadar yapılan toplam satış.

---

### Toplam Tahsilat

Müşteriden alınan toplam ödeme.

---

### Güncel Alacak

Henüz tahsil edilmemiş borç.

Yani;

```
Toplam Satış

-

Toplam Tahsilat
```

---

# Satışlar

Detay sayfasında müşteriye ait tüm satışlar kronolojik olarak listelenir.

Her satış kartında;

* Tarih
* Ürünler
* KDV
* Toplam Tutar
* Kalan Borç

gösterilir.

---

# Yeni Satış

Müşteri detayından + butonuna basılarak oluşturulur.

Satış ekranında;

## Ürün Seçimi

Ürün listesi açılır.

Bir veya birden fazla ürün seçilebilir.

Her ürün için;

* Miktar

girilecektir.

---

## Fiyat

Her ürün için fiyat değiştirilebilir.

Varsayılan olarak;

ürünün kayıtlı satış fiyatı gelir.

Kullanıcı isterse bu fiyatı değiştirebilir.

Eğer fiyat alanı boş bırakılırsa;

otomatik olarak ürünün liste fiyatı kullanılır.

---

## KDV

KDV ürün bazında değil,

**satış bazında**

hesaplanacaktır.

Satış oluşturulurken kullanıcı;

* %0
* %10
* %20

oranlarından birini seçer.

Seçilen oran satışın toplam tutarına uygulanır.

Örneğin;

```
Ürün Toplamı

1000 TL

KDV %20

=

1200 TL
```

Bu değer müşterinin borcuna eklenir.

---

# Stok Güncelleme

Satış kaydedildiğinde;

satılan ürünlerin stok miktarı otomatik düşürülür.

Örneğin;

```
Stok

50

Satış

5

Yeni Stok

45
```

Kullanıcının manuel işlem yapmasına gerek kalmaz.

---

# Tahsilat Sistemi

Borç ayrı,

ödeme ayrı tutulacaktır.

Yani satış oluşturmak;

müşteriye borç yazmak anlamına gelir.

Tahsilat ekranında kullanıcı;

* Tahsilat Tutarı
* Açıklama

girer.

Örneğin;

```
5000 TL

Açıklama

"Nakit ödeme"
```

Bu işlem;

müşterinin borcundan otomatik düşülür.

Bütün ödeme hareketleri kayıt altında tutulur.

---

# Hareket Geçmişi

Her müşteri için geçmiş saklanacaktır.

Geçmişte;

* Satışlar
* Tahsilatlar

aynı zaman akışında gösterilebilir.

Her kayıt için;

* Tarih
* Saat
* Açıklama

saklanacaktır.

---

# Raporlar

Uygulamada ayrı bir rapor ekranı bulunacaktır.

Burada işletmenin genel durumu gösterilir.

## Gösterilecek Veriler

### Toplam Alacak

Henüz tahsil edilmemiş tüm müşteri borçları.

---

### Toplam Mal Varlığı

Depodaki mevcut ürünlerin toplam değeri.

---

### Bu Ay Yapılan Satış

İçinde bulunulan ayın toplam satış hacmi.

---

İleride eklenebilir;

* Günlük satış
* Haftalık satış
* En çok satılan ürün
* En çok alışveriş yapan müşteri
* Son tahsilatlar
* Son satışlar

---

# Veri Saklama

Uygulamadaki tüm veriler JSON formatında tutulacaktır.

Örneğin;

```
customers.json

products.json

sales.json

payments.json
```

---

# Veri Aktarma

Kullanıcı;

## Export

ile tüm verileri tek dosya halinde dışarı aktarabilir.

Bu özellik;

* yedek almak
* başka cihaza taşımak

için kullanılacaktır.

---

## Import

Dışarı aktarılan dosya tekrar uygulamaya yüklenebilir.

Böylece tüm;

* müşteriler
* ürünler
* satışlar
* tahsilatlar

tek işlemle geri yüklenebilir.

---

# Cihazlar Arası Senkronizasyon

Bulut altyapısı olarak GitHub kullanılabilir.

Mantık şu şekilde çalışacaktır;

* Tüm veriler JSON dosyalarında tutulur.
* GitHub Repository içerisinde saklanır.
* Uygulama belirli aralıklarla veya manuel olarak senkronizasyon yapar.
* Bir cihazda yapılan değişiklik diğer cihazlarda da görünür.

Avantajları:

* Ek sunucu maliyeti yoktur.
* Kurulumu kolaydır.
* Veriler sürüm geçmişiyle birlikte saklanabilir.

### Dikkat Edilmesi Gerekenler

GitHub API'sinde rate limit (istek sınırı) bulunmaktadır.

* Kimlik doğrulaması yapılmadan limit oldukça düşüktür.
* Personal Access Token ile bu limit saatte binlerce isteğe çıkar ve normal kullanım için genellikle yeterlidir.

Ancak GitHub gerçek zamanlı veritabanı değildir. Bu nedenle her işlemde API çağrısı yapmak yerine verileri cihazda önbelleğe almak, değişiklik olduğunda veya kullanıcı manuel senkronizasyon istediğinde GitHub'a göndermek daha doğru olacaktır. Çok kullanıcılı veya yoğun senaryolar için ise Firebase, Supabase ya da Appwrite gibi çözümler daha uygundur.

---

# Tema

Uygulama iki farklı tema destekleyecektir.

## Light Mode

* Beyaz ağırlıklı
* Minimal
* Modern

---

## Dark Mode

* Koyu gri arka plan
* Mavi ve yeşil vurgu renkleri
* Göz yormayan tasarım

Tema sistem ayarına göre otomatik değişebilir veya kullanıcı tarafından manuel olarak seçilebilir.

---

# Genel Tasarım Prensipleri

* Modern Material Design anlayışı
* Minimal ve sade arayüz
* Büyük dokunma alanları
* Tek elle rahat kullanım
* Hızlı erişim
* Tüm ekleme işlemlerinin sağ alttaki **+** butonundan yapılması
* Kart tabanlı tasarım
* Yuvarlatılmış köşeler
* Açık ve koyu tema desteği
* Güçlü arama ve filtreleme
* Tarihçesi tutulabilen tüm finansal işlemler
* Otomatik stok ve cari hesap yönetimi

Bu yapı ile İşimNet, küçük işletmelerin günlük satış, stok ve cari hesap süreçlerini tek bir mobil uygulama üzerinden hızlı, düzenli ve güvenilir şekilde yönetmesini sağlayan kapsamlı bir işletme yönetim uygulaması olacaktır.