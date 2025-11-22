'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

// TEMPLATE SPREADSHEET ID - Production Ready
const TEMPLATE_SPREADSHEET_ID = '1WbVbQknd59wUWk-EEc-ChClWxgpKfefguscM89OB2Xs'; // Actual template sheet

export function SheetSetupWizard() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSheet = async () => {
    setIsCreating(true);

    try {
      // Google Sheets force copy URL
      const copyUrl = `https://docs.google.com/spreadsheets/d/${TEMPLATE_SPREADSHEET_ID}/copy`;

      // Yeni sekmede aç
      window.open(copyUrl, '_blank');

      // Kullanıcıya mesaj göstermek için 2 saniye bekle
      setTimeout(() => {
        alert(`
🎉 KOPYALAMA BAŞLATILDI!

📝 Adımlar:
1. Google Sheets yeni sayfası açıldı
2. "Şablondan kopyala"ya tıklayın
3. "Kopyala"yı seçin
4. İsim verin (örnek: "İlaç Takip Verilerim")
5. Google Drive'ınızda kaydedilsin
6. Paylaşın: "Herkes düzenleyebilir" yapın
7. URL'den ID'yi alın: https://docs.google.com/spreadsheets/d/[ID_KISMI]/edit
8. Bu ID'yi profil ayarlarına girin

✅ Hazır olunca profille sayfasından kaydedebilirsiniz!
        `);
        setIsCreating(false);
      }, 2000);

    } catch (error) {
      console.error('Sheets template açılırken hata:', error);
      alert('Hata oluştu. Lütfen tekrar deneyin.');
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="text-center">
        <div className="mb-4 text-6xl">📊</div>

        <h3 className="text-2xl font-bold text-blue-900 mb-2">
          Google Sheets Kurulumu
        </h3>

        <p className="text-blue-700 mb-6 max-w-md mx-auto">
          Kişisel ilaç takip verileriniz için Google Sheets şablonu oluşturun.
          Bu şablon hazır tüm başlıklar ve tablo yapısıyla gelir.
        </p>

        <Button
          variant="success"
          size="xl"
          onClick={handleCreateSheet}
          disabled={isCreating}
          className="mb-4"
        >
          {isCreating ? '🎯 Açılıyor...' : '📋 İlaç Takip Şablonunu Oluştur'}
        </Button>

        <div className="text-sm text-blue-600">
          <p className="mb-2">✅ Hazır şablon: Kullanıcı profili, ilaçlar, geçmiş kayıtları</p>
          <p className="mb-2">✅ Otomatik yapılandırma: Tüm başlıklar hazır</p>
          <p>✅ Güvenli depolama: Sizin Google hesabınızda kalır</p>
        </div>

        {isCreating && (
          <div className="mt-4 text-blue-800 font-semibold animate-pulse">
            ⏳ Google Sheets sayfası açılıyor...<br/>
            Eğer popup blocker varsa lütfen izin verin.
          </div>
        )}
      </div>
    </div>
  );
}
