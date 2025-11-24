// VOICE GUIDE SYSTEM - Yaşlı kullanıcılar için sesli rehber
class VoiceGuide {
  private synth!: SpeechSynthesis; // Definitely assigned in constructor
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;

      // Türk sesleri yüklenene kadar bekle
      this.loadVoices();

      // Sayfa load olduğunda başlangıç mesajı
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.announceWelcome();
        }, 2000);
      });

      // Kullanıcı sayfadan çıkarsa durdur
      window.addEventListener('beforeunload', () => {
        this.stopSpeaking();
      });
    }
  }

  // Kullanılabilir sesleri yükle
  private loadVoices() {
    const loadVoices = () => {
      this.voices = this.synth.getVoices();

      // Türkçe dil içeren sesleri tercih et
      const turkishVoices = this.voices.filter(voice =>
        voice.lang.includes('tr') || voice.lang.includes('TR')
      );

      // Eğer Türkçe ses varsa kullan, yoksa varsayılan kullan
      if (turkishVoices.length > 0) {
        this.defaultVoice = turkishVoices[0];
      }
    };

    loadVoices();

    // Bazı tarayıcılarda sesler async yüklenir
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // Sesli karşılama mesajı
  private announceWelcome() {
    const hour = new Date().getHours();

    let message = "";
    if (hour >= 5 && hour < 12) {
      message = "Günaydın! İlaç takip sistemine hoş geldiniz. Yardımcı olmaya hazırım.";
    } else if (hour >= 12 && hour < 17) {
      message = "İyi günler! İlaç hatırlatma sisteminiz hazır.";
    } else if (hour >= 17 && hour < 22) {
      message = "İyi akşamlar! Akşam ilaç zamanlarını hatırlayalım.";
    } else {
      message = "İyi geceler! Gecelik ilaçlarınız için buradayım.";
    }

    this.speak(message);
  }

  // Ana ses çıkarma fonksiyonu
  async speak(text: string, priority: 'normal' | 'urgent' | 'reminder' = 'normal') {
    if (!this.isEnabled || !this.synth) {
      console.log('Voice disabled or not supported');
      return;
    }

    // Önemli mesaj için önceki mesajı durdur
    if (priority === 'urgent' || priority === 'reminder') {
      this.stopSpeaking();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);

      // Ses ayarları (yaşlı dostu)
      utterance.lang = 'tr-TR'; // Türkçe
      utterance.rate = priority === 'reminder' ? 0.9 : 0.8; // Hafif yavaş
      utterance.pitch = 1.0; // Normal perde
      utterance.volume = priority === 'urgent' ? 0.9 : 0.8; // Yüksek ses

      // Türkçe ses varsa kullan
      if (this.defaultVoice) {
        utterance.voice = this.defaultVoice;
      }

      // Ses tamamlandı olayını dinle
      utterance.onend = () => {
        console.log('Voice message completed:', text.substr(0, 30) + '...');
        this.currentUtterance = null;
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);

      console.log('🎤 Speaking:', text.substr(0, 50) + (text.length > 50 ? '...' : ''));

    } catch (error) {
      console.error('Voice synthesis failed:', error);
    }
  }

  private defaultVoice: SpeechSynthesisVoice | null = null;

  // İlaç hatırlatma mesajı
  announceReminder(medicine: {
    ilac_adi: string;
    doz: number;
    birim: string;
    zaman?: string;
  }) {
    const timeText = medicine.zaman ? `${medicine.zaman} zamanı ` : '';
    const message = `Hatırlatma! ${timeText}${medicine.ilac_adi} ilacınızı ${medicine.doz} ${medicine.birim} almanız gerekiyor.`;

    this.speak(message, 'reminder');
  }

  // İlaç alındığında onay
  confirmMedicineTaken(medicineName: string) {
    this.speak(`${medicineName} ilacını aldığınızı onayladım. Başka ilacınız var mı kontrol ediyorum.`);
  }

  // Sayfa navigasyonu rehberliği
  guideNavigation(action: string) {
    const guides: Record<string, string> = {
      'add_medicine': 'İlaç eklemek için, sağ üstteki yeşil artı butonuna basın.',
      'view_medicines': 'İlaçlarınızı görmek için, ana sayfadaki ilaçlar butonuna basın.',
      'settings': 'Ayarlar sayfasına gitmek için, menüdeki ayarlar butonuna basın.',
      'profile': 'Profilinizi düzenlemek için, üstteki isim butonuna basın.',
      'help': 'Yardım için, herhangi bir sayfada soru işareti butonuna basın.',
      'show_details': 'Daha fazla bilgi görmek için, detayları göster butonuna basın.',
      'take_medicine': 'İlacı aldığınızda, büyük yeşil aldım butonuna basın.',
      'contact_pharmacy': 'Eczane ile iletişime geçmek için, mavi telefon butonuna basın.',
      'show_reminders': 'Hatırlatmaları görmek için, zaman butonuna basın.',
      'backup_data': 'Veri yedeğini almak için, ayarlar sayfasındaki yedek butonuna basın.',
    };

    const message = guides[action] || `${action} yapmak için ilgili butona tıklayın.`;
    this.speak(message);
  }

  // Durum güncellemeleri
  announceStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const prefixes = {
      success: 'Başarıyla tamamlandı:',
      error: 'Uyarı:',
      info: 'Bilgilendirme:'
    };

    this.speak(`${prefixes[type]} ${message}`);
  }

  // Stok uyarıları
  announceLowStock(medicineName: string, remainingStock: number) {
    const message = `${medicineName} ilacınızın stoğu azalıyor. Sadece ${remainingStock} adet kaldı. Lütfen yeni paket alın.`;
    this.speak(message, 'urgent');
  }

  // Çoklu ilaç hatırlatmaları
  announceMultipleReminders(medicines: Array<{ ilac_adi: string; zaman?: string }>) {
    if (medicines.length === 1) {
      this.announceReminder(medicines[0] as any);
      return;
    }

    let message = `Şu anda ${medicines.length} ilaç vaktiniz geldi. `;

    medicines.forEach((med, index) => {
      const timeInfo = med.zaman ? ` ${med.zaman}'de ` : '';
      message += `${timeInfo}${med.ilac_adi}, `;
    });

    message += 'İlaçlarınıza alın.';

    this.speak(message, 'urgent');
  }

  // İlk kullanım rehberi
  guideFirstTime() {
    const instructions = [
      'İlaç takip sistemine hoş geldiniz.',
      'İlk olarak profil bilginizi doldurun.',
      'Sonra ilaçlarınızı eklemeye başlayabilirsiniz.',
      'Her ilaç için fotoğraf eklemeyi unutmayın.',
      'Vakit geldiğinde hatırlatmalar gelecek.',
      'Takip etmek kolay, sadece aldım butonuna basın.'
    ];

    // Sırayla konuş (5 saniye aralıkla)
    instructions.forEach((text, index) => {
      setTimeout(() => {
        this.speak(text);
      }, index * 6000); // 6 saniye beklenecek
    });
  }

  // Ses ayarları
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;

    if (!enabled) {
      this.stopSpeaking();
      this.speak('Sesli rehber kapatıldı.');
    } else {
      this.speak('Sesli rehber aktif edildi.');
    }
  }

  // Hız ayarı (yaşlılar için)
  setSpeed(speed: 'slow' | 'normal' | 'fast') {
    // Speed ayarını hatırlayıp ileriki konuşmalarda kullan
    const speedMap = { slow: 0.7, normal: 0.85, fast: 1.0 };
    localStorage.setItem('voiceSpeed', speed);
    this.speak(`Ses hızı ${speed} olarak ayarlandı.`);
  }

  // Ses durdurma
  stopSpeaking() {
    if (this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  // Durum bilgisi
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isSpeaking: this.synth?.speaking || false,
      voicesLoaded: this.voices.length > 0,
      turkishVoices: this.voices.filter(v => v.lang.includes('tr')).length,
      defaultVoice: this.defaultVoice?.name,
    };
  }
}

// Global instance
export const voiceGuide = new VoiceGuide();

// Helper functions for common actions
export const voiceHelpers = {
  // Sayfa yüklenince
  announcePageLoad: () => voiceGuide.speak('Sayfa yüklendi.'),

  // Başarılı işlem sonrasında
  confirmAction: (action: string) => voiceGuide.announceStatus(`${action} başarıyla tamamlandı`, 'success'),

  // Hata durumunda
  announceError: (error: string) => voiceGuide.announceStatus(`Hata: ${error}`, 'error'),

  // İlaç ekleme rehberi
  guideAddMedicine: () => voiceGuide.guideNavigation('add_medicine'),

  // İlacın vakti geldi
  medicineTime: (medicine: any) => voiceGuide.announceReminder(medicine),

  // İlk kullanım
  welcomeNewUser: () => voiceGuide.guideFirstTime(),

  // Telefon arama rehberi
  guideCall: (contact: string) => voiceGuide.speak(`${contact} ile iletişime geçmek için telefon butonuna basın.`),
};
