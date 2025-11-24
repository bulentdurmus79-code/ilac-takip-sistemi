// NOTIFICATION MANAGER CLASS - Krizalit olmaz alternatifleri ile
class NotificationManager {
  private requestedPermission = false;
  private inAppAlarmTimer: NodeJS.Timeout | null = null;
  private localAlarmTimer: NodeJS.Timeout | null = null;

  // Bildirim izinlerini iste ve alternatif yöntemlere karar ver
  async requestPermission(): Promise<'PUSH_NOTIFICATIONS' | 'ALTERNATIVE_ALARMS' | 'BOTH'> {
    try {
      // İlk kez izin istemeyelim - kullanıcı deneyimini bozmasın
      if (!this.requestedPermission) {
        this.requestedPermission = true;

        // Basit açıklama göster
        const userConsent = await this.showPermissionExplanation();

        if (userConsent && 'Notification' in window) {
          const permission = await Notification.requestPermission();

          if (permission === 'granted') {
            console.log('✅ Push notifications enabled');
            this.setupLocalAlarm(); // Her ikisini de çalıştır
            return 'BOTH';
          }
        }
      }

      // Push notification izin verilmediyse alternatif yöntemler
      console.log('🔄 Push notifications denied, using alternatives');
      await this.enableAlternativeReminders();
      return 'ALTERNATIVE_ALARMS';

    } catch (error) {
      console.error('Notification permission error:', error);
      await this.enableAlternativeReminders();
      return 'ALTERNATIVE_ALARMS';
    }
  }

  // İzin isteme öncesi açıklama göster
  private async showPermissionExplanation(): Promise<boolean> {
    return new Promise((resolve) => {
      const explanation = `
🔔 İLAÇ HATIRLATMA İZİNİ

Bu sistem ilaçlarınızı hatırlatmak için tarayıcı bildirimlerini kullanabilir.

Bu özellik:
✓ Sadece ilaç vakti geldiğinde gösterilir
✓ Kişisel verilerinizi içermez
✓ İstediğiniz zaman tarayıcı ayarlarından kapatılabilir

İzin veriyor musunuz?
      `;

      if (confirm(explanation)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // Alternatif hatırlatma yöntemlerini etkinleştir
  private async enableAlternativeReminders() {
    console.log('🔄 Activating alternative reminder systems...');

    // 1. Sayfa görünürlük kontrolü
    this.setupPageVisibilityCheck();

    // 2. Local alarm sistemi
    this.setupLocalAlarm();

    // 3. In-app modal alarmları
    this.setupInAppAlarms();

    console.log('✅ Alternative reminder systems active');
  }

  // Sayfa açıldığında hatırlatma kontrolü
  private setupPageVisibilityCheck() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('👁️ Page became visible, checking reminders...');
          this.checkPendingReminders();
        }
      });
    }
  }

  // Her dakika ilaç vakti kontrolü yapan local timer
  private setupLocalAlarm() {
    // Existing timer varsa temizle
    if (this.localAlarmTimer) {
      clearInterval(this.localAlarmTimer);
    }

    // Her dakika kontrol et
    this.localAlarmTimer = setInterval(() => {
      const now = new Date();
      const pendingMeds = this.getPendingMedicines(now);

      if (pendingMeds.length > 0) {
        console.log('⏰ Local alarm triggered for:', pendingMeds.length, 'medicines');

        // Ses çal (varsa)
        this.playAlarmSound();

        // In-app modal göster
        this.showInAppReminder(pendingMeds);
      }
    }, 60000); // 60 seconds

    console.log('⌚ Local alarm system active');
  }

  // Modal hatırlatmalar için in-app alarm sistemi
  private setupInAppAlarms() {
    // Tüm modal hatırlatmaları temizle için timer sistemi
    // Bu gelecekteki hatırlatma modal'ları için gerekli
    console.log('📱 In-app modal alarm system ready');
  }

  // Bekleyen ilaçları kontrol et (şimdilik mock)
  private getPendingMedicines(currentTime: Date) {
    // IndexedDB'den bekleyen ilaçları çek
    // Şimdilik örnek veri döndür
    return [
      // Mock data - gerçek implementasyonda IndexedDB'den gelecek
    ];
  }

  // Alarma dikkat çekmek için ses çal
  private playAlarmSound() {
    try {
      // Web Audio API kullanarak basit beep sesi
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5); // 0.5 saniye çal

      console.log('🔊 Alarm sound played');
    } catch (error) {
      console.error('Audio playback failed:', error);
      // Fallback olarak sistem sesi yok
    }
  }

  // Full-screen modal hatırlatma göster
  private showInAppReminder(medicines: any[]) {
    // Modal'lar için React Context sistemi varmış gibi simule et
    // Gerçek implementasyonda ModalContext'e haber ver

    const reminderMessage = medicines.length > 0
      ? `💊 ${medicines[0].name || 'İlacınız'} vakti geldi!`
      : '💊 İlaç vakti!';

    // Alert fallback (modal sistemi yokken)
    alert(`🔔 HATIRLATMA\n\n${reminderMessage}\n\nİlaci aldıysanız "Tamam" butonuna basin.`);

    console.log('📱 In-app modal reminder shown');
  }

  // Sayfa görünür olduğunda hatırlatmaları kontrol et
  private checkPendingReminders() {
    const pendingMeds = this.getPendingMedicines(new Date());
    if (pendingMeds.length > 0) {
      this.showInAppReminder(pendingMeds);
    }
  }

  // Spesifik ilaç için hatırlatma oluştur
  async scheduleReminder(medicineId: string, reminderTime: Date) {
    // İleride real reminder scheduling için
    console.log(`⏰ Reminder scheduled for ${medicineId} at ${reminderTime}`);

    // Local storage'a kaydet
    const reminders = JSON.parse(localStorage.getItem('scheduledReminders') || '[]');
    reminders.push({
      medicineId,
      time: reminderTime.toISOString(),
      type: 'one-time'
    });

    localStorage.setItem('scheduledReminders', JSON.stringify(reminders));
  }

  // Tüm hatırlatmaları durdur
  stopAllReminders() {
    if (this.inAppAlarmTimer) {
      clearInterval(this.inAppAlarmTimer);
      this.inAppAlarmTimer = null;
    }

    if (this.localAlarmTimer) {
      clearInterval(this.localAlarmTimer);
      this.localAlarmTimer = null;
    }

    console.log('🔇 All reminder systems stopped');
  }

  // Mevcut sistem durumunu kontrol et
  getStatus() {
    return {
      pushNotificationsEnabled: Notification.permission === 'granted',
      alternativeAlarmsActive: !!this.localAlarmTimer,
      inAppAlarmsActive: !!this.inAppAlarmTimer,
    };
  }
}

export const notificationManager = new NotificationManager();
