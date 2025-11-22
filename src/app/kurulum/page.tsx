'use client';

import { useRouter } from 'next/navigation';

export default function SetupGuidePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        <header className="mb-8">
          <button
            onClick={handleBack}
            className="mb-4 text-blue-600 hover:text-blue-800 text-lg"
          >
            ← Geri Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Google API Kurulum Rehberi
          </h1>
          <p className="text-xl text-gray-600">
            Bu kurulum bakıcı veya aile üyesi tarafından yapılmalıdır. Yaşlı kullanıcılar için gereklidir.
          </p>
        </header>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6">
            <h2 className="text-2xl font-semibold mb-2">Adım 1: Google Cloud Console'a Giriş</h2>
            <div className="text-gray-700 space-y-2">
              <p>1. <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">console.cloud.google.com</a> adresine gidin</p>
              <p>2. Google hesabınızla giriş yapın</p>
              <p>3. "Yeni Proje Oluştur" veya mevcut bir proje seçin</p>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h2 className="text-2xl font-semibold mb-2">Adım 2: API'leri Etkinleştirin</h2>
            <div className="text-gray-700 space-y-2">
              <p>1. Sol menüden "API'ler ve Hizmetler" → "Kütüphane"</p>
              <p>2. "Google Sheets API" arayın ve etkinleştirin</p>
              <p>3. "Google Calendar API" arayın ve etkinleştirin</p>
              <p>4. "Google Drive API" arayın ve etkinleştirin</p>
            </div>
          </div>

          <div className="border-l-4 border-yellow-500 pl-6">
            <h2 className="text-2xl font-semibold mb-2">Adım 3: OAuth 2.0 Kimlik Bilgileri</h2>
            <div className="text-gray-700 space-y-2">
              <p>1. "API'ler ve Hizmetler" → "Kimlik Bilgileri"</p>
              <p>2. "+ KİMLİK BİLGİLERİ OLUŞTUR" → "OAuth 2.0 İstemci Kimliği"</p>
              <p>3. Uygulama türü: "Web uygulaması"</p>
              <p>4. Yetkili yönlendirme URI'leri: <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:3000/api/auth/callback/google</code></p>
              <p>  Üretim için: <code className="bg-gray-200 px-2 py-1 rounded">https://yourdomain.com/api/auth/callback/google</code></p>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h2 className="text-2xl font-semibold mb-2">Adım 4: Dosyaları Yapılandırma</h2>
            <div className="text-gray-700 space-y-2">
              <p>1. Oluşturulan kimlik bilgisinden Client ID ve Client Secret'ı alın</p>
              <p>2. .env.local dosyasını açın</p>
              <p>3. GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET yerine yazın</p>
            </div>
          </div>

          <div className="border-l-4 border-red-500 pl-6">
            <h2 className="text-2xl font-semibold mb-2">Adım 5: Google Sheets Veri Yapısı</h2>
            <div className="text-gray-700 space-y-3">
              <p><strong>5.1 Spreadsheet Oluştur:</strong></p>
              <ul className="ml-6 space-y-1">
                <li>• <a href="https://sheets.google.com" target="_blank" className="text-blue-600 underline">sheets.google.com</a> açın</li>
                <li>• "Yeni yeni" butonuna tıklayarak yeni bir spreadsheet oluşturun</li>
                <li>• İsim olarak "İlaç Takip Verilerim" koyabilir</li>
              </ul>

              <p><strong>5.2 Sheet'leri Oluştur:</strong> Alt taraftaki "+" ikonuna tıklayarak aşağıdaki sheet'leri oluşturun:</p>
              <ul className="ml-6 bg-yellow-50 p-3 rounded space-y-1">
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">kullanici</code> (User profile bilgileri için)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">ilaclar</code> (İlaç bilgileri için)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">ilac_gecmis</code> (İlaç alım geçmişi için)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">kan_sekeri</code> (Kan şekeri ölçümleri için)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">tansiyon</code> (Tansiyon ölçümleri için)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">diger_olcumler</code> (Diğer ölçümler için)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">sync_kuyruk</code> (Offline sync için)</li>
              </ul>

              <p><strong>5.3 Başlık Satırlarını Ekle:</strong></p>
              <p>Her sheet'in A1 hücresine aşağıdaki başlıkları kopyalayın:</p>

              <div className="bg-gray-50 p-4 rounded text-sm">
                <p><strong>kullanici sheet'i (A1:H1):</strong> kullanici_email | isim | soyisim | cinsiyet | yas | hastaliklar | api_key_area | olusturma_tarihi</p>
                <p><strong>ilaclar sheet'i (A1:J1):</strong> ilac_id | ilac_adi | doz | birim | zamanlar | stok | foto_url | kullanici_email | aktif | olusturma_tarih</p>
                <p><strong>ilac_gecmis sheet'i (A1:J1):</strong> kayit_id | ilac_id | tarih | saat | durum | erteleme_dk | not | sync | timestamp</p>
                <p><strong>Diğer sheet'ler için:</strong> README.md dosyasındaki tabloları inceleyin</p>
              </div>

              <p><strong>5.4 Spreadsheet ID'yi Al:</strong></p>
              <ul className="ml-6 space-y-1">
                <li>• URL'den ID kısmını kopyalayın: <code>https://docs.google.com/spreadsheets/d/[ID]/edit</code></li>
                <li>• Bu ID'yi .env.local dosyasında <code>GOOGLE_SHEETS_SPREADSHEET_ID</code> olarak ayarlayın</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Bitirdikten Sonra:</h3>
          <p className="text-gray-700">
            Kurulum tamamlandıktan sonra uygulamayı yeniden başlatın. Yaşlı kullanıcı artık bakıcı yardımına ihtiyaç kalmadan hesaplarını güvenli bir şekilde yönetebilir.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
