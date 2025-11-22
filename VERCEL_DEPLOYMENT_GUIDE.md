# 🚀 Vercel Deployment Rehberi - İlaç Takip Sistemi

*Detaylı Adım-Adım Kurulum Kılavuzu - Hızlı ve Sorunsuz Deploy*

## 📋 ÖNDEPLOYMENT HAZIRLIKLARI

### 1. **Proje Dosyalarının Kontrolü**

```bash
cd ilactakip
# Gerekli dosyaların varlığını kontrol edin:
ls -la
```

**Zorunlu Dosyalar:**
- ✅ `package.json` - Dependencies tanımlı
- ✅ `vercel.json` - Vercel konfigürasyonu
- ✅ `next.config.js` - Next.js konfigürasyonu
- ✅ `src/app/**` - All uygulama dosyaları
- ✅ `.gitignore` - Duzgün yapılandırılmış

### 2. **Local Test (Önemli!)**
```bash
# Local'da çalışıp çalışmadığını test edin
npm run build

# Build başarılıysa devam edin
npm run dev
```

**Not:** Build hataları varsa düzeltmeden deployment'a geçmeyin!

## 🎯 STEP-by-STEP VERSEL DEPLOYMENT

### **Adım 1: Vercel Hesabı Oluşturma (5 Dakika)**

1. **Vercel Websitesine Git**
   ```
   https://vercel.com
   ```

2. **Ücretsiz Hesap Oluştur**
   - GitHub/GitLab ile giriş yapın (Tavsiye: GitHub)
   - "Continue with GitHub" butonuna tıklayın
   - Repository erişim izni verin

3. **Dashboard'a Eriş**
   - Ana sayfaya yönlendirileceksiniz
   - "New Project" butonuna tıklayın

### **Adım 2: Proje Import ve Konfigürasyon (10 Dakika)**

#### **2.1 Proje Seçimi**
```bash
# Vercel Dashboard'da
1. "Import Git Repository" seçin
2. "ilactakip" repository'sini bulun/seçin
3. "Import" butonuna tıklayın
```

#### **2.2 Project Settings Konfigürasyonu**

**Proje adı ayarı:**
```
Project Name: ilac-takip-[sizinin-adi]
Framework Preset: Next.js
Root Directory: ./ilactakip (varsayılana bırakın)
```

**Build Settings:**
```
Build Command: npm run build
Output Directory: .next (otomatik)
Install Command: npm install
```

**Node.js Version:**
```
Node.js Version: 18.x (Production'da 18.x kullanacağız)
```

### **Adım 3: Environment Variables Konfigürasyonu (15 Dakika)**

#### **3.1 Vercel Dashboard'da Environment Variables Bölümü**

```bash
# Vercel Project Settings > Environment Variables
1. "Add New" butonuna tıklayın
```

#### **3.2 NextAuth Environment Variables**

```
✅ NEXTAUTH_URL
Value: https://ilac-takip-[sizinin-adi].vercel.app
Environment: Production

✅ NEXTAUTH_SECRET
Value: [Güçlü rastgele string üretin]
Environment: Production
How to: `openssl rand -base64 32` komutu ile üretin
```

#### **3.3 Google API Environment Variables**

```
✅ GOOGLE_CLIENT_ID
Value: [Google Cloud Console'dan aldığınız Client ID]
Environment: Production

✅ GOOGLE_CLIENT_SECRET
Value: [Google Cloud Console'dan aldığınız Client Secret]
Environment: Production

✅ GOOGLE_API_KEY
Value: [Google Cloud Console'dan aldığınız API Key]
Environment: Production

✅ GOOGLE_SHEETS_SPREADSHEET_ID
Value: [İlk kullanıcının Google Sheets ID'si veya boş]
Environment: Production
Note: İlk kullanıcı kendi spreadsheet ID'sini kullanacak
```

#### **3.4 Production vs Development**

**Production Environment Variables:**
- Tüm API keys ve secrets buraya
- Google OAuth redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

### **Adım 4: Domain Yapılandırması (Opsiyonel - 5 Dakika)**

#### **4.1 Vercel Domain Kurulumu**
```bash
# Vercel Project Settings > Domains
1. "Add" butonuna tıklayın
2. İstediğiniz domain adını girin: örneğin "ilactakim.com"
3. DNS ayarlarını tamamlayın (20-30 dakika sürebilir)
```

**Not:** Vercel ücretsiz domain de verebilir, satın almadan deploy edebilirsiniz.

### **Adım 5: FAQ ve Troubleshooting

#### P1: **"Build Failed" Hatası Çözümü**
```bash
# Local'de test edin
npm run build

# Build cache temizleyin
rm -rf .next

# Node modules yeniden yükleyin
rm -rf node_modules
npm install

# Vercel'de rebuild tetikleyin
# Project Dashboard > Deployments > Trigger Deploy
```

#### P2: **Environment Variables Eksik Hatası**
```bash
# Vercel Dashboard'da kontrol edin
Project Settings > Environment Variables

# Tüm değişkenlerin Environment: Production olduğundan emin olun
```

#### P3: **Google OAuth Redirect URI Hatası**
```bash
# Google Cloud Console'da
APIs & Services > Credentials > OAuth Client > URIs

# Production URI'sini ekleyin:
https://your-vercel-domain.vercel.app/api/auth/callback/google
```

### **Adım 6: Deployment Sonrası Test (5 Dakika)**

#### **6.1 Temel Fonksiyon Testleri**
1. **Deploy URL'ine git:**
   ```
   https://ilac-takip-[sizinin-adi].vercel.app
   ```

2. **Giriş testi:**
   - "Giriş" butonuna tıkla
   - Google ile giriş yap
   - Profil sayfasına yönlendirildiğini kontrol et

3. **Kurulum sayfası:**
   - `/kurulum` adresine git
   - Tüm adımların görüntülendiğini doğrula

#### **6.2 API Endpoint Testleri**
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Auth check
curl https://your-domain.vercel.app/api/auth/session
```

### **Adım 7: Büyük Ölçek İçin Optimizasyon**

#### **7.1 Analytics Kurulumu**
```bash
# Vercel Analytics (Ücretsiz)
1. Vercel Dashboard > Project Settings > Analytics
2. "Enable Vercel Analytics" aktif et
```

#### **7.2 Monitor/Loglama**
```bash
# Vercel Logları
Project Dashboard > Functions tab
Recent invocation logs
```

#### **7.3 Performance Monitoring**
- Vercel Analytics dashboard'u kullanın
- API response times'larını izleyin
- Error rates'larını takip edin

## 🔧 VERSEL SPECIFIC DEPLOYMENT CONF

### **vercel.json Dosyası Açıklaması**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

**Bu dosya zaten projede mevcut ve optimize edilmiş durumda.**

## 🚀 QUICK DEPLOYMENT SCRIP

```bash
# 5 Dakikalık Express Deploy

# 1. GitHub'a push edin
git add .
git commit -m "Ready for production"
git push origin main

# 2. Vercel CLI (isteğe bağlı)
npm i -g vercel
vercel --prod

# 3. Environment Variables ekleyin (yukarıdaki gibi)

# 4. Deploy URL'ine test edin
```

## ⚠️ ÖZENLİ UYULMASI GEREKENLER

### ✅ **Do and Don'ts**

#### **Yapın:**
- ✅ Environment variables'ı çok dikkatli girin
- ✅ Google OAuth redirect URI'sini doğru ayarlayın
- ✅ İlk deploy sonrası test edin
- ✅ Google Cloud Console'da production domain'ini ekleyin

#### **Yapmayın:**
- ❌ Development environment variables'ını production'a koymayın
- ❌ API keys'leri yanlış ortamlarda kullanmayın
- ❌ Domain ayarlanmadan kullanıcıyı testi yaptırmayın

### **Monitoring Checklist (Haftalık)**

```bash
# Vercel Dashboard'da düzenli kontrol edin:
✅ Successful deployments
✅ Function performance
✅ Error rates < %1
✅ Response times < 1000ms
✅ Cold start times optimal
```

## 🎯 DEPLOYMENT ZAMAN ÇİZGESİ

- **Hazırlık:** 5 dk (git/github)
- **Vercel Setup:** 10 dk (account + project)
- **Env Config:** 15 dk (Google APIs)
- **Domain Setup:** 5 dk (opsiyonel)
- **Test & Validation:** 10 dk
- **Toplam:** 45 dk (ilk kez)

## 📞 DESTEK VE HATA ÇÖZÜMÜ

### **Hızlı Destek**
1. **Vercel Docs:** https://vercel.com/docs
2. **Build Logs:** Vercel Dashboard > Functions logs
3. **Common Issues:** Bu dokümanın Troubleshooting bölümü

### **Acı Kriz Durum**
- Vercel Support: https://vercel.com/support
- GitHub Issues: SSS'ler için
- Email: Critical hatalar için

---

## 🎉 BAŞARI KONTROLLERİ

Deploy tamamlandıktan sonra:

- [ ] ✅ Site yükleniyor
- [ ] ✅ Google giriş çalışıyor
- [ ] ✅ Profil sayfası erişilebilir
- [ ] ✅ API endpoints yanıt veriyor
- [ ] ✅ Küreirim sayfası çalışıyor
- [ ] ✅ Mobile responsive
- [ ] ✅ HTTPS aktif

**Tüm kontroller tamamlandıysa: Sisteminiz production-ready! 🚀**
