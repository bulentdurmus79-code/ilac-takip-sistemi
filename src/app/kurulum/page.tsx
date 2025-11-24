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
            ⏯️ Süper Kolay Google Sheets Kurulumu
          </h1>
          <p className="text-xl text-gray-600">
            Sadece 3 adımda kişisel veri saklama alanınızı hazırlayın! Hiç teknik bilgi gerekmiyor.
          </p>
        </header>

        <div className="space-y-6">
          {/* Büyük tanıtım kartı */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-xl">
            <div className="text-center">
              <div className="text-8xl mb-4">🎯</div>
              <h2 className="text-4xl font-bold mb-4">1 Dakikalık Kurulum!</h2>
              <p className="text-xl opacity-90">
                Karmaşık API ayarları olmadan anında hazırsınız. Sadece tıklayıp kopyala!
              </p>
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-8 bg-blue-50 p-6 rounded-r-lg">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">📋 Sadece 3 Adım:</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Şablonu Kopyala</h3>
                  <p className="text-gray-700">Aşağıdaki butona tıklayarak hazır Google Sheets şablonu kendi Google Drive'ınızda kopyalayın.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">İsim Verin</h3>
                  <p className="text-gray-700">"İlaç Takip [İsminiz]" gibi anlamlı bir isim verin.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">URL'den ID'yi Alın</h3>
                  <p className="text-gray-700">Google Sheets URL'sinden son kısımdaki ID'yi kopyalayın. (Örnek: /d/[ID]/edit)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ana kurulum butonu */}
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-dashed border-gray-300 max-w-lg w-full text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Google Sheets Şablonu</h3>
              <p className="text-gray-600 mb-6">
                Hazır veri yapılarına sahip şablonu 1 tıkla kopyalayın. Hiç teknik bilgi gerekmiyor!
              </p>
              <button
                onClick={() => {
                  const templateUrl = 'https://docs.google.com/spreadsheets/d/1EzHGDwKgt--A86w_k90ISrDKlagdeuyU0ryaEmoVOiY/edit?usp=sharing';
                  window.open(templateUrl, '_blank');

                  setTimeout(() => {
                    alert('🎉 Şablon yeni sekmede açıldı!\n\n📝 Lütfen:\n1. "Dosya" → "Şablondan kopyala" seçin\n2. "İlaç Takip [İsminiz]" gibi isim verin\n3. Save edin ve URL\'den ID\'yi alın\n\n🏁 Hazır olunca profil doldurabilirsin!');
                  }, 1500);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Şablonu Kopyala (Ücretsiz!)
              </button>
              <p className="text-sm text-gray-500 mt-4">
                📞 Sorunuz olursa WhatsApp'tan yazın: +90 XYZ
              </p>
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
