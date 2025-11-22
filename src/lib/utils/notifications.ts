// Sesli bildirim ve akıllı öneriler için yardımcı fonksiyonlar

export class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;
  private isAvailable: boolean = false;

  constructor() {
    this.initSpeechCapabilities();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initSpeechCapabilities() {
    if (typeof window !== 'undefined') {
      this.isAvailable = 'speechSynthesis' in window;

      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          this.hasPermission = permission === 'granted';
        });
      }
    }
  }

  async speak(text: string, options = { rate: 0.75, pitch: 1.05, volume: 0.8 }) {
    if (!this.isAvailable) {
      console.warn('Ses sentezi bu tarayıcıda desteklenmiyor');
      return;
    }

    return new Promise<void>((resolve) => {
      // Önceki sesi durdur
      window.speechSynthesis.cancel();

      // Metni daha doğal hale getir - noktalama işaretlerini daha akıcı yap
      let processedText = text
        .replace(/\s+/g, ' ') // Çoklu boşlukları temizle
        .replace(/,\s*/g, ', ') // Virgülden sonra tek boşluk
        .replace(/\.\s*/g, '.') // Noktadan sonra yeni cümle değil
        .replace(/!\s*/g, '! ') // Ünlemden sonra boşluk
        .replace(/\?\s*/g, '? '); // Sorudan sonra boşluk

      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.rate = options.rate; // Daha yavaş ve doğal (0.7-0.9 arası)
      utterance.pitch = options.pitch; // Kadınsı veya erkeksi ses için (0.8-1.2 arası)
      utterance.volume = options.volume; // Daha yüksek ses (0.7-0.9 arası)
      utterance.lang = 'tr-TR'; // Türkçe

      // Doğal ses kalitesi için ses seçimi
      const voices = window.speechSynthesis.getVoices();
      const turkishVoice = voices.find(voice =>
        voice.lang.includes('tr') ||
        voice.name.includes('Türkçe') ||
        voice.name.includes('Turkish')
      );

      if (turkishVoice) {
        utterance.voice = turkishVoice;
      }

      // Daha uzun ifadelerde kısa duraklamalar ekle
      if (text.length > 50) {
        // Rastgele kısa duraklamalar ekle
        utterance.onboundary = (event) => {
          if (event.name === 'word' && Math.random() < 0.3) {
            // Kelime arası küçük duraklama (50-100ms)
            utterance.rate = utterance.rate * 0.95;
            setTimeout(() => {
              utterance.rate = options.rate;
            }, 50);
          }
        };
      }

      // Ses başlangıcında hafif gecikme
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('Ses sentezi hatası:', error);
        resolve();
      };
    });
  }

  async notify(title: string, body: string, icon?: string) {
    if (!this.hasPermission) {
      return false;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/icon-pill.png',
        silent: false, // Bildirim sesi
      });

      // Otomatik kapanma
      setTimeout(() => {
        notification.close();
      }, 5000);

      return true;
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
      return false;
    }
  }

  // İlaç hatırlatma mesajı - Daha arkadaş canlısı
  async announceMedicine(medicineName: string, dose: string, time: string) {
    const messages = [
      `Merhaba! ${dose} ${medicineName} ilacını alma saati geldi. Saat: ${time}`,
      `Hatırlatma: Şimdi ${time}, ${dose} ${medicineName} ilacı vakti.`,
      `Merhaba! İlacınızın ${medicineName} ${dose}, saati ${time} oldu.`,
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(message, { rate: 0.8, pitch: 1.0, volume: 0.7 });

    await this.notify(
      '💊 İlacınız Hazır!',
      `${dose} ${medicineName} - Saat: ${time}`,
      '/icon-clock.png'
    );
  }

  // Stok uyarısı - Daha sakin ve endişe verici olmadan
  async announceLowStock(medicineName: string, stock: number) {
    if (stock < 3) {
      const messages = [
        `Bilgilendirme: ${medicineName} ilacından ${stock} adet kaldı. Yakında yenilemeniz gerekebilir.`,
        `Uyarı: ${medicineName} stok miktarı az. ${stock} adet kaldı.`,
        `Not: ${medicineName} ilacı için ${stock} adet kaldı. Eczaneye uğrayın.`,
      ];

      const message = messages[Math.floor(Math.random() * messages.length)];
      await this.speak(message, { rate: 0.7, pitch: 0.95, volume: 0.75 });

      await this.notify(
        '📦 Stok Bilgilendirmesi',
        `${medicineName}: ${stock} adet kaldı`,
        '/icon-warning.png'
      );
    }
  }

  // Acil stok uyarısı - Daha endişe verici ama panik yapmadan
  async announceCriticalStock(medicineName: string) {
    const messages = [
      `Dikkat! ${medicineName} ilacı çok az kaldı. Lütfen yeni ilaç alın.`,
      `Önemli hatırlatma: ${medicineName} ilacı bitmek üzere. Eczaneden yenileyin.`,
      `Uyarı: ${medicineName} stokemiciglardır, lütfen temin edin.`,
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(message, { rate: 0.85, pitch: 0.9, volume: 0.85 });

    await this.notify(
      '⚠️ Stok Dikkati!',
      `${medicineName} bitmek üzere!`,
      '/icon-alert.png'
    );
  }

  // Sabah hatırlatması - Daha sıcak ve motive edici
  async morningGreeting(name: string) {
    const messages = [
      `Günaydın ${name}! Yeni güne ilaçınızla başlayalım. Sağlıklı bir gün geçirin!`,
      `Merhaba ${name}! Sabahınız hayırlı olsun. İlacınız hazır mı?`,
      `Günaydın ${name}! İlacınızı alarak gününüze başlayın. Enerjik olun!`,
      `Merhaba ${name}! Bugün de düzenli kullanıma devam. Başarabilirsiniz!`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    // Sabah için daha yüksek pitch (kadınsı) ve neşeli ton
    await this.speak(randomMessage, { rate: 0.8, pitch: 1.15, volume: 0.8 });
  }

  // Akşam dinlenme hatırlatması
  async eveningRemind() {
    const messages = [
      `Akşam oldu. İlacınızı almayı unutmayın. Rahat bir gece geçirin.`,
      `Akşam saati geldi. İlacınız hazır mı? İyi bir gece uyku alırsınız.`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(randomMessage, { rate: 0.75, pitch: 1.0, volume: 0.7 });
  }

  stop() {
    if (this.isAvailable) {
      window.speechSynthesis.cancel();
    }
  }
}

export const notificationService = NotificationService.getInstance();
