İlaç Takip Sistemi - Analiz ve Çözüm Önerileri
Dokümanınızı detaylı inceledim. Yaşlı bakım sistemi için KVKK uyumlu, offline-first bir ilaç takip sistemi geliştirme planınız çok kapsamlı. İşte karşılaşabileceğiniz zorluklar ve çözüm önerilerim:

🎯 Kritik Sorunlar ve Çözümler
1. Google Sheets API - Client-Side Kullanım Sorunu
Sorun: Dokümanda Google Sheets API'nin client-side kullanımı önerilmiş, ancak bu yaklaşım bazı güvenlik ve teknik zorluklar içeriyor.
Çözüm Önerileri:
A) Hibrit Yaklaşım (Önerilen):
typescript// Server-side: Sadece template oluşturma
// pages/api/create-user-sheet.ts
export default async function handler(req, res) {
  const { userEmail } = req.body;
  
  // Kullanıcının kendi Google hesabında sheet oluştur
  // Hiçbir veri saklanmaz, sadece boş template
  const sheetUrl = await createEmptySheetTemplate(userEmail);
  
  return res.json({ sheetUrl });
}

// Client-side: Tüm CRUD işlemleri
const saveToUserSheet = async (data) => {
  const userToken = session.accessToken; // OAuth token
  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: userSheetId,
    range: 'ilaclar!A:Z',
    valueInputOption: 'RAW',
    resource: { values: [data] }
  });
};
B) Tamamen Client-Side (Daha Güvenli):
typescript// GAPI kütüphanesini client-side kullan
const initGoogleAPI = () => {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets'
    });
  });
};

2. IndexedDB Sync Karmaşıklığı
Sorun: Offline queue yönetimi ve çakışma çözümü karmaşık olabilir.
Çözüm: Basitleştirilmiş Sync Pattern
typescript// lib/sync/SyncManager.ts
class SyncManager {
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;

  async addToQueue(operation: SyncOperation) {
    // Önce local'e kaydet
    await indexedDB.save(operation.table, operation.data);
    
    // Queue'ya ekle
    this.syncQueue.push({
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    });
    
    // Online'sa hemen sync et
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return;
    
    this.isSyncing = true;
    
    // FIFO mantığı ile işle
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue[0];
      
      try {
        await this.syncToCloud(operation);
        this.syncQueue.shift(); // Başarılı, kuyruktan çıkar
      } catch (error) {
        operation.retryCount++;
        
        // 3 denemeden sonra başarısızsa, kullanıcıya bildir
        if (operation.retryCount >= 3) {
          this.notifyUserSyncFailed(operation);
          this.syncQueue.shift(); // Kuyruktan çıkar
        } else {
          break; // Daha sonra tekrar dene
        }
      }
    }
    
    this.isSyncing = false;
  }

  private async syncToCloud(operation: SyncOperation) {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operation)
    });
    
    if (!response.ok) throw new Error('Sync failed');
  }
}

// Kullanım
const syncManager = new SyncManager();

// İlaç eklendiğinde
await syncManager.addToQueue({
  type: 'INSERT',
  table: 'medicines',
  data: newMedicine
});

3. PWA Notification İzinleri
Sorun: Kullanıcılar notification izni vermeyebilir, özellikle yaşlı kullanıcılar.
Çözüm: Alternatif Hatırlatma Sistemi
typescript// lib/notifications/NotificationManager.ts
class NotificationManager {
  async requestPermission() {
    // Önce basit bir açıklama göster
    const userConsent = await this.showPermissionExplanation();
    
    if (userConsent) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        return 'PUSH_NOTIFICATIONS';
      }
    }
    
    // İzin verilmediyse alternatif yöntemler
    return this.enableAlternativeReminders();
  }

  private async enableAlternativeReminders() {
    // 1. Seçenek: Page Visibility API ile tab açıksa göster
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkPendingReminders();
      }
    });
    
    // 2. Seçenek: Local alarm (setInterval)
    this.setupLocalAlarm();
    
    // 3. Seçenek: Google Calendar entegrasyonu
    return 'CALENDAR_EVENTS';
  }

  private setupLocalAlarm() {
    setInterval(() => {
      const now = new Date();
      const pendingMeds = this.getPendingMedicines(now);
      
      if (pendingMeds.length > 0) {
        // Sesli uyarı + modal göster
        this.playAlarmSound();
        this.showInAppReminder(pendingMeds);
      }
    }, 60000); // Her dakika kontrol
  }

  private showInAppReminder(medicines: Medicine[]) {
    // Tam ekran modal - kapatılamaz
    return (
      <div className="fixed inset-0 bg-red-500 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h1 className="text-6xl mb-4">💊 İLAÇ VAKTİ!</h1>
          <p className="text-4xl">{medicines[0].ilac_adi}</p>
          <button className="mt-8 h-24 w-full bg-green-500 text-white text-3xl">
            ALDIM ✓
          </button>
        </div>
      </div>
    );
  }
}

4. Google OAuth Token Yenileme
Sorun: Access token'lar 1 saat sonra expire olur, refresh token yönetimi gerekir.
Çözüm: Otomatik Token Yenileme
typescript// lib/auth/tokenManager.ts
class TokenManager {
  private refreshTokenTimer: NodeJS.Timeout | null = null;

  async getValidToken(): Promise<string> {
    const session = await getSession();
    
    // Token'ın geçerlilik süresini kontrol et
    if (this.isTokenExpired(session.accessToken)) {
      return await this.refreshAccessToken(session.refreshToken);
    }
    
    return session.accessToken;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as { exp: number };
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    const data = await response.json();
    
    // Yeni token'ı session'a kaydet
    await this.updateSessionToken(data.access_token);
    
    return data.access_token;
  }

  startAutoRefresh() {
    // Her 50 dakikada bir token'ı yenile (60 dk expiry'den önce)
    this.refreshTokenTimer = setInterval(async () => {
      const session = await getSession();
      if (session?.refreshToken) {
        await this.refreshAccessToken(session.refreshToken);
      }
    }, 50 * 60 * 1000);
  }
}

5. Yaşlı Kullanıcı Deneyimi İyileştirmeleri
Sorun: Karmaşık UI, küçük butonlar, teknoloji korkusu.
Çözüm: Ultra-Basit Interface
tsx// components/SimpleMedicineCard.tsx
export function SimpleMedicineCard({ medicine }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
      {/* Sadece ilaç resmi ve ismi */}
      <div className="flex flex-col items-center gap-6">
        <img 
          src={medicine.foto_url} 
          alt={medicine.ilac_adi}
          className="w-48 h-48 rounded-2xl object-cover"
        />
        
        <h2 className="text-5xl font-bold text-center">
          {medicine.ilac_adi}
        </h2>

        {/* Tek bir büyük buton */}
        <button
          onClick={() => handleTakeMedicine(medicine)}
          className="w-full h-32 bg-green-500 hover:bg-green-600 
                     text-white text-4xl font-bold rounded-2xl
                     active:scale-95 transition-transform"
        >
          💊 ALDIM
        </button>

        {/* Detaylar göster (isteğe bağlı) */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-2xl text-gray-500 underline"
        >
          {showDetails ? '▲ Gizle' : '▼ Detayları Göster'}
        </button>

        {showDetails && (
          <div className="text-3xl text-gray-700 space-y-4 w-full">
            <p>⏰ Saat: <strong>{medicine.zaman}</strong></p>
            <p>💊 Doz: <strong>{medicine.doz} {medicine.birim}</strong></p>
            <p>📦 Kalan: <strong>{medicine.stok} adet</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
Sesli Rehber Ekleme:
typescript// lib/voiceGuide.ts
class VoiceGuide {
  private synth = window.speechSynthesis;

  speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.8; // Yavaş konuşma
    utterance.pitch = 1;
    utterance.volume = 1;
    
    this.synth.speak(utterance);
  }

  announceReminder(medicine: Medicine) {
    this.speak(
      `İlaç zamanı! ${medicine.ilac_adi} ilacınızı 
       ${medicine.doz} ${medicine.birim} almalısınız.`
    );
  }

  guideUser(action: string) {
    const guides = {
      'add_medicine': 'Yeni ilaç eklemek için yeşil artı butonuna basın',
      'take_medicine': 'İlacı aldıysanız yeşil butona basın',
      'view_history': 'Geçmişi görmek için takvim butonuna basın'
    };
    
    this.speak(guides[action] || action);
  }
}

6. Veri Kaybını Önleme Stratejisi
Sorun: Browser cache temizlenirse tüm veriler gider.
Çözüm: Multi-Layer Backup
typescript// lib/backup/BackupManager.ts
class BackupManager {
  async createAutoBackup() {
    const allData = await this.exportAllData();
    
    // 1. Google Drive'a otomatik yedekleme
    await this.saveToGoogleDrive(allData);
    
    // 2. LocalStorage'a son yedek tarihini kaydet
    localStorage.setItem('last_backup', new Date().toISOString());
    
    // 3. Kullanıcıya indirilebilir JSON dosyası sun
    this.offerDownloadBackup(allData);
  }

  private async exportAllData() {
    const medicines = await indexedDB.getAll('medicines');
    const history = await indexedDB.getAll('medicine_history');
    const profile = await indexedDB.get('user_profile');
    
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: { medicines, history, profile }
    };
  }

  private async saveToGoogleDrive(data: any) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: `ilac_yedek_${Date.now()}.json`,
      mimeType: 'application/json'
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(data) +
      close_delim;

    await gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });
  }

  private offerDownloadBackup(data: any) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ilac_yedek_${Date.now()}.json`;
    link.click();
  }

  async restoreFromBackup(file: File) {
    const data = JSON.parse(await file.text());
    
    // Verileri geri yükle
    await indexedDB.bulkInsert('medicines', data.data.medicines);
    await indexedDB.bulkInsert('medicine_history', data.data.history);
    await indexedDB.save('user_profile', data.data.profile);
    
    alert('Yedek başarıyla geri yüklendi!');
  }
}

7. Performans Optimizasyonu
Sorun: Büyük veri setlerinde yavaşlama.
Çözüm: Veri Sayfalama ve Lazy Loading
typescript// lib/db/pagination.ts
class PaginatedQuery {
  private pageSize = 50;
  private currentPage = 0;

  async getMedicines(page: number = 0) {
    const db = await openDB('IlacTakipDB');
    const tx = db.transaction('medicines', 'readonly');
    const store = tx.objectStore('medicines');
    
    // Index kullanarak hızlı sorgulama
    const index = store.index('aktif');
    const cursor = await index.openCursor();
    
    const results: Medicine[] = [];
    let skipped = 0;
    const skipCount = page * this.pageSize;
    
    while (cursor) {
      if (skipped < skipCount) {
        skipped++;
        await cursor.continue();
        continue;
      }
      
      if (results.length >= this.pageSize) break;
      
      results.push(cursor.value);
      await cursor.continue();
    }
    
    return results;
  }

  async searchMedicines(query: string) {
    // Fuzzy search için Fuse.js kullan
    const allMeds = await this.getAllMedicines();
    const fuse = new Fuse(allMeds, {
      keys: ['ilac_adi', 'etken_madde'],
      threshold: 0.3
    });
    
    return fuse.search(query).map(result => result.item);
  }
}

🚀 Önerilen Geliştirme Sırası
Hafta 1-2: Temel Altyapı

✅ Next.js projesi kurulumu
✅ Google OAuth entegrasyonu
✅ IndexedDB schema oluşturma
✅ Basit profil sayfası

Hafta 3-4: Core Fonksiyonlar

✅ İlaç ekleme/düzenleme/silme
✅ İlaç kartları UI
✅ Offline data storage
✅ Basit notification sistemi

Hafta 5-6: İleri Özellikler

✅ Google Sheets sync
✅ Foto yükleme (Google Drive)
✅ Geçmiş görüntüleme
✅ Stok takibi

Hafta 7-8: PWA ve Optimizasyon

✅ Service Worker
✅ Push notifications
✅ Performance tuning
✅ User testing


🎨 Tasarım Önerileri
Renk Paleti (Yaşlı Dostu)
css:root {
  --primary: #4CAF50;      /* Yeşil - İlaç alındı */
  --danger: #F44336;       /* Kırmızı - Uyarı */
  --warning: #FF9800;      /* Turuncu - Stok azaldı */
  --info: #2196F3;         /* Mavi - Bilgi */
  --bg: #F5F5F5;           /* Açık gri - Arka plan */
  --text: #212121;         /* Koyu gri - Metin */
  
  /* Yüksek kontrast */
  --contrast-ratio: 7:1;   /* WCAG AAA standard */
}
Tip Ölçekleri
css.text-elderly {
  font-size: clamp(24px, 5vw, 48px); /* Responsive büyük metin */
  line-height: 1.5;
  font-weight: 600;
  font-family: 'Roboto', 'Arial', sans-serif;
}

.button-elderly {
  min-height: 80px;
  min-width: 200px;
  font-size: 32px;
  border-radius: 16px;
  padding: 20px 40px;
}

⚠️ Ek Dikkat Edilmesi Gerekenler
1. KVKK Compliance Checklist

 Kullanıcı verilerinin server'a gitmediğini doğrula
 Privacy policy sayfası ekle (Türkçe)
 Cookie consent banner (sadece analytics için)
 Veri silme hakkı (hesap silme butonu)
 Veri taşınabilirlik (export butonu)

2. Güvenlik

 XSS koruması (input sanitization)
 CSRF token kullanımı
 Secure headers (CSP, HSTS)
 Rate limiting (API abuse önleme)

3. Test Stratejisi
typescript// Yaşlı kullanıcı testleri
describe('Elderly User Flow', () => {
  it('should add medicine with large buttons', async () => {
    const addButton = screen.getByRole('button', { name: /ekle/i });
    expect(addButton).toHaveStyle({ minHeight: '80px' });
  });

  it('should show high contrast colors', () => {
    const card = screen.getByTestId('medicine-card');
    expect(getContrastRatio(card)).toBeGreaterThan(7);
  });
});

Bu çözüm önerileri ile projenizi daha sağlam ve kullanıcı dostu hale getirebilirsiniz. 