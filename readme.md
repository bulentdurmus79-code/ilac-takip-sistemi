# İlaç Takip Sistemi - Devam Eden Geliştirme Promptu

## 🎯 Proje Özeti
Yaşlı kullanıcılar için tasarlanmış, tamamen ÜCRETSİZ, Google servisleri tabanlı (Sheets, Calendar, Drive) PWA ilaç takip sistemi.

### ✨ Özel Özellikler (Ücretsiz!)
- **🎤 Sesli Bildirimler**: Tarayıcı tabanlı Türkçe ses sentezi ile hatırlatmalar
- **🤖 Akıllı Öneriler**: Eğitim düzeyi yüksek algoritmalar (ML olmadan)
- **🔒 KVKK Uyumluluk**: Her kullanıcının verisi kendi Google hesabında
- **📱 Offline-First**: İnternet olmadan çalışabilme
- **👥 Bakıcı Dostu**: Detaylı kurulum rehberi

### 🔒 KVKK Uyumluluk Özeti
- **Her kullanıcı kendi Google hesabında saklar**: Kişisel veriler Vercel'de KALMIYOR
- **10-50 kullanıcı için ölçeklenebilir**: Her kullanıcı bağımsız veri sahibi
- **Vercel'de sadece uygulama kodu**: Hiçbir kullanıcı verisi bulunmaz
- **Gizlilik ve Güvenlik**: GDPR/KVKK tam uyumlu, Avrupa standartlarında

## 📋 Teknik Stack
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS (yaşlı kullanıcılar için büyük butonlar)
- **Hosting**: Vercel (ücretsiz)
- **Veritabanı**: Google Sheets API
- **Bildirim**: Google Calendar API
- **Depolama**: Google Drive API (fotoğraflar)
- **Auth**: NextAuth.js + Google OAuth 2.0
- **Offline**: IndexedDB + Service Worker + Background Sync

## 🏗️ Proje Yapısı
```
ilac-takip/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── giris/
│   │   │   └── callback/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Ana layout + navigation
│   │   │   ├── page.tsx             # Dashboard ana sayfa
│   │   │   ├── ilaclar/
│   │   │   │   ├── page.tsx         # İlaç listesi
│   │   │   │   ├── ekle/page.tsx    # Yeni ilaç ekleme
│   │   │   │   └── [id]/page.tsx    # İlaç detay/düzenle
│   │   │   ├── olcumler/
│   │   │   │   ├── page.tsx         # Ölçüm listesi
│   │   │   │   ├── kan-sekeri/page.tsx
│   │   │   │   ├── tansiyon/page.tsx
│   │   │   │   └── diger/page.tsx
│   │   │   ├── al/
│   │   │   │   └── page.tsx         # Deep link "Aldım" ekranı
│   │   │   └── raporlar/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── ilac/
│   │   │   │   ├── ekle/route.ts
│   │   │   │   ├── guncelle/route.ts
│   │   │   │   ├── sil/route.ts
│   │   │   │   ├── aldim/route.ts
│   │   │   │   └── hatirla/route.ts
│   │   │   ├── olcum/
│   │   │   │   ├── ekle/route.ts
│   │   │   │   └── liste/route.ts
│   │   │   ├── takvim/
│   │   │   │   ├── olustur/route.ts
│   │   │   │   └── guncelle/route.ts
│   │   │   ├── fotograf/
│   │   │   │   ├── yukle/route.ts
│   │   │   │   └── sil/route.ts
│   │   │   └── sync/
│   │   │       └── route.ts         # Offline sync endpoint
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # Temel UI bileşenleri
│   │   │   ├── Button.tsx           # Büyük, erişilebilir butonlar
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── ilac/
│   │   │   ├── IlacKart.tsx         # Fotoğraflı ilaç kartı
│   │   │   ├── IlacForm.tsx
│   │   │   ├── AldimEkrani.tsx      # Aldım/Hatırlat ekranı
│   │   │   └── StokGosterge.tsx
│   │   ├── olcum/
│   │   │   ├── KanSekeriForm.tsx
│   │   │   ├── TansiyonForm.tsx
│   │   │   └── OlcumGrafik.tsx
│   │   ├── offline/
│   │   │   ├── OfflineGosterge.tsx
│   │   │   └── SyncDurum.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       └── PWAPrompt.tsx
│   ├── lib/
│   │   ├── google/
│   │   │   ├── sheets.ts            # Sheets API wrapper
│   │   │   ├── calendar.ts          # Calendar API wrapper
│   │   │   ├── drive.ts             # Drive API wrapper
│   │   │   └── auth.ts              # OAuth helper
│   │   ├── db/
│   │   │   ├── indexeddb.ts         # Offline storage
│   │   │   └── sync.ts              # Background sync logic
│   │   ├── utils/
│   │   │   ├── date.ts              # Tarih formatları
│   │   │   ├── stok.ts              # Stok hesaplamaları
│   │   │   └── bildirim.ts          # Bildirim helpers
│   │   └── constants.ts
│   └── types/
│       ├── ilac.ts
│       ├── olcum.ts
│       └── sheets.ts
├── public/
│   ├── manifest.json                # PWA manifest
│   ├── sw.js                        # Service Worker
│   ├── icons/                       # PWA ikonları
│   └── placeholder-ilac.png
├── .env.local                       # Google API credentials
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🔑 Gerekli Environment Variables (.env.local)
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Google APIs
GOOGLE_API_KEY=your-api-key
```

## 📊 Google Sheets Yapısı

### Sheet 1: "ilaclar"
```
ilac_id | ilac_adi | doz | birim | zamanlar | stok | foto_url | kullanici_email | aktif | olusturma_tarih
--------|----------|-----|-------|----------|------|----------|-----------------|-------|----------------
ilac-1  | Aspirin  | 2   | tb    | 09:00,21:00 | 28 | drive... | user@gmail.com | TRUE | 2024-11-22
```

### Sheet 2: "ilac_gecmis"
```
kayit_id | ilac_id | tarih | saat | durum | erteleme_dk | not | sync | timestamp
---------|---------|-------|------|-------|-------------|-----|------|----------
kg-1     | ilac-1  | 2024-11-22 | 09:05 | alindi | 5 | - | TRUE | 1732262700
```

### Sheet 3: "kan_sekeri"
```
kayit_id | tarih | saat | deger | tur | normal | not | sync | timestamp
---------|-------|------|-------|-----|--------|-----|------|----------
ks-1     | 2024-11-22 | 09:15 | 110 | aclik | TRUE | - | TRUE | 1732263000
```

### Sheet 4: "tansiyon"
```
kayit_id | tarih | saat | sistolik | diyastolik | nabiz | normal | not | sync | timestamp
---------|-------|------|----------|------------|-------|--------|-----|------|----------
tn-1     | 2024-11-22 | 09:15 | 120 | 80 | 72 | TRUE | - | TRUE | 1732263000
```

### Sheet 5: "diger_olcumler"
```
kayit_id | tarih | saat | tip | deger | birim | normal | not | sync | timestamp
---------|-------|------|-----|-------|-------|--------|-----|------|----------
do-1     | 2024-11-22 | 08:00 | kilo | 75 | kg | TRUE | - | TRUE | 1732260000
```

### Sheet 6: "sync_kuyruk"
```
offline_id | tip | data_json | timestamp | islendi | islem_tarihi
-----------|-----|-----------|-----------|---------|-------------
off-1      | ilac_alindi | {...} | 1732262700 | FALSE | -
```

## 🎨 Tailwind Yapılandırması (Yaşlı Kullanıcılar için)
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'xxl': '2rem',      // Büyük başlıklar
        'xxxl': '2.5rem',   // Ana butonlar
      },
      spacing: {
        '18': '4.5rem',     // Büyük buton yüksekliği
        '20': '5rem',
      },
      colors: {
        'basarili': '#4CAF50',
        'uyari': '#FF9800',
        'hata': '#F44336',
        'bilgi': '#2196F3',
      }
    }
  }
}
```

## 🔄 Modül Geliştirme Sırası

### ✅ MODÜL 1: Temel Altyapı (Öncelik: Kritik)
**Dosyalar:**
- `src/lib/google/auth.ts` - Google OAuth
- `src/lib/google/sheets.ts` - Sheets API
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/(auth)/giris/page.tsx`
- `src/components/ui/Button.tsx`

**Test Kriteri:** Kullanıcı Gmail ile giriş yapabilmeli ve Sheets'e bağlanabilmeli.

---

### ✅ MODÜL 2: İlaç Yönetimi (Öncelik: Yüksek)
**Dosyalar:**
- `src/types/ilac.ts`
- `src/lib/google/calendar.ts`
- `src/lib/google/drive.ts`
- `src/app/api/ilac/ekle/route.ts`
- `src/app/(dashboard)/ilaclar/ekle/page.tsx`
- `src/components/ilac/IlacForm.tsx`
- `src/components/ilac/IlacKart.tsx`

**Test Kriteri:** İlaç eklenebilmeli, fotoğraf yüklenebilmeli, Calendar'a hatırlatıcı oluşturulabilmeli.

---

### ✅ MODÜL 3: Aldım/Hatırlat Sistemi (Öncelik: Yüksek)
**Dosyalar:**
- `src/app/api/ilac/aldim/route.ts`
- `src/app/api/ilac/hatirla/route.ts`
- `src/app/(dashboard)/al/page.tsx`
- `src/components/ilac/AldimEkrani.tsx`
- `src/lib/utils/stok.ts`

**Test Kriteri:** Deep link çalışmalı, "Aldım" butonu Sheets'e kaydedilmeli, "Hatırlat" Calendar'a eklenmeli.

---

### ✅ MODÜL 4: Offline Sync (Öncelik: Orta)
**Dosyalar:**
- `src/lib/db/indexeddb.ts`
- `src/lib/db/sync.ts`
- `src/app/api/sync/route.ts`
- `public/sw.js` (Service Worker)
- `src/components/offline/OfflineGosterge.tsx`
- `src/components/offline/SyncDurum.tsx`

**Test Kriteri:** İnternet olmadan kayıt yapılabilmeli, internet geldiğinde otomatik sync çalışmalı.

---

### ✅ MODÜL 5: Sağlık Ölçümleri (Öncelik: Orta)
**Dosyalar:**
- `src/types/olcum.ts`
- `src/app/api/olcum/ekle/route.ts`
- `src/app/(dashboard)/olcumler/page.tsx`
- `src/components/olcum/KanSekeriForm.tsx`
- `src/components/olcum/TansiyonForm.tsx`
- `src/components/olcum/OlcumGrafik.tsx`

**Test Kriteri:** Kan şekeri ve tansiyon kaydedilebilmeli, grafik gösterilebilmeli.

---

### ✅ MODÜL 6: PWA & Bildirimler (Öncelik: Düşük)
**Dosyalar:**
- `public/manifest.json`
- `public/sw.js` (genişletilmiş)
- `src/components/layout/PWAPrompt.tsx`
- `src/lib/utils/bildirim.ts`

**Test Kriteri:** Ana ekrana eklenebilmeli, web push notifications çalışmalı.

---

### ✅ MODÜL 7: Raporlar ve İstatistikler (Öncelik: Düşük)
**Dosyalar:**
- `src/app/(dashboard)/raporlar/page.tsx`
- `src/lib/utils/istatistik.ts`

**Test Kriteri:** Haftalık/aylık raporlar görüntülenebilmeli, PDF export çalışmalı.

---

## 🚀 Production Deployment - Hızlı Başlangıç

### **1-Klik Deploy Script'i**
```bash
# Otomatik deployment
node deploy.js
```
**İçerik:** Vercel hesabı oluşturma, GitHub'a push, environment variables konfigürasyonu

### **Detaylı Deployment Rehberi**
📖 **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Adım adım kurulum

### **Güvenlik Raporu**
🔒 **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)** - Production-ready güvenlik raporu

### **Production Checklist**
- [ ] Vercel hesap aktif
- [ ] Google Cloud Console kurulmuş
- [ ] API keys hazır
- [ ] Deploy script çalışır durumda
- [ ] KVKK uyumluluk onaylandı

---

## 💻 Devam Etme Promptu

Bir sonraki oturumda şu promptu kullan:

```
İlaç Takip Sistemi geliştirmeye devam ediyorum.

SON DURUM:
- Tamamlanan Modüller: [modül isimleri]
- Şu an üzerinde çalıştığım modül: [modül adı]
- Sorunlar/Eksikler: [varsa belirt]

DEVAM EDİLECEK YER:
[Hangi dosya/fonksiyon yarım kaldı]

Lütfen [MODÜL ADI]'nı tamamlamamda yardımcı ol. Özellikle:
1. [Tamamlanması gereken özellik 1]
2. [Tamamlanması gereken özellik 2]

Kod yazmaya devam et, kaldığın yerden başla.
```

## 🎯 Önemli Tasarım Prensipleri

### Yaşlı Kullanıcılar İçin UX
```typescript
// Buton örneği
<button className="
  w-full h-20           // Çok büyük
  text-2xl              // Çok büyük yazı
  font-bold             // Kalın
  bg-green-500          // Yüksek kontrast
  text-white
  rounded-2xl
  shadow-lg
  active:scale-95       // Dokunma feedback
  transition-all
">
  ✓ ALDIM
</button>

// Form input örneği
<input className="
  w-full h-16
  text-xl
  px-6
  border-4             // Kalın kenarlık
  border-gray-400
  rounded-xl
  focus:border-blue-500
  focus:ring-4         // Büyük focus ring
"/>
```

### Offline First Mantığı
```typescript
// Her veri işlemi önce offline'a kaydet
async function ilacAlindi(ilacId: string) {
  const kayit = {
    id: generateId(),
    ilacId,
    tarih: new Date().toISOString(),
    durum: 'alindi'
  };
  
  // 1. Önce IndexedDB'ye kaydet
  await saveToIndexedDB('ilac_gecmis', kayit);
  
  // 2. İnternet varsa Sheets'e kaydet
  if (navigator.onLine) {
    try {
      await saveToSheets(kayit);
      await markAsSynced(kayit.id);
    } catch (error) {
      // Hata olursa offline'da kalsın
      console.error('Sync failed', error);
    }
  }
  
  // 3. UI'ı güncelle
  return kayit;
}
```

### Google API Rate Limiting
```typescript
// Batch işlemler kullan
const BATCH_SIZE = 10;

async function syncOfflineRecords() {
  const records = await getUnsyncedRecords();
  
  // 10'ar 10'ar gönder
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await sheets.batchUpdate(batch);
    
    // Rate limit aşımını önle
    await sleep(1000); // 1 saniye bekle
  }
}
```

## 📝 Örnek API Endpoint Yapısı
```typescript
// src/app/api/ilac/aldim/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sheetsService } from '@/lib/google/sheets';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ilacId, tarih, saat } = await request.json();
    
    // Validasyon
    if (!ilacId) {
      return NextResponse.json({ error: 'İlaç ID gerekli' }, { status: 400 });
    }

    // Sheets'e kaydet
    const kayit = await sheetsService.addRecord('ilac_gecmis', {
      kayit_id: generateId(),
      ilac_id: ilacId,
      tarih,
      saat,
      durum: 'alindi',
      sync: true,
      timestamp: Date.now()
    });

    // Stok güncelle
    await sheetsService.updateStock(ilacId, -1);

    return NextResponse.json({ success: true, kayit });
  } catch (error) {
    console.error('İlaç alındı hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
```

## 🚀 Hızlı Başlangıç Komutları
```bash
# Proje oluştur
npx create-next-app@latest ilac-takip --typescript --tailwind --app

# Gerekli paketler
npm install next-auth @google-cloud/sheets @google-cloud/calendar @google-cloud/storage
npm install idb date-fns recharts lucide-react

# Geliştirme sunucusu
npm run dev

# Production build
npm run build
```

## ✅ Her Modül İçin Checklist
- [ ] TypeScript tipleri tanımlandı
- [ ] API endpoint oluşturuldu
- [ ] UI bileşeni hazırlandı
- [ ] Offline desteği eklendi
- [ ] Error handling yapıldı
- [ ] Loading states eklendi
- [ ] Erişilebilirlik kontrol edildi
- [ ] Mobile responsive test edildi
- [ ] Yaşlı kullanıcı testi yapıldı

---

**NOT:** Her modülü tamamladıktan sonra bir sonraki modüle geçmeden önce test et ve çalıştığından emin ol. Modüler yapı sayesinde her parça bağımsız geliştirilebilir.
