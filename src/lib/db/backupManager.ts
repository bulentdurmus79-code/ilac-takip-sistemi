// DATA BACKUP MANAGER CLASS - Multiple backup strategy
import { indexedDBService } from './indexeddb';
import { tokenManager } from '../auth/tokenManager';

interface BackupData {
  version: string;
  createdAt: string;
  medicines: any[];
  medicineHistory: any[];
  profiles: any[];
}

class BackupManager {
  private lastBackup: number = 0;
  private readonly BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 saat
  private readonly DOWNLOAD_FILE_NAME = 'ilac_yedek.json';

  // Mevcut kullanıcının email'ini al
  private async getCurrentUserEmail(): Promise<string | null> {
    try {
      // NextAuth session'den email al
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      return data?.user?.email || null;
    } catch (error) {
      console.error('Failed to get user email:', error);
      return null;
    }
  }

  // Otomatik backup'ı başlat
  async initializeAutoBackup() {
    console.log('🔄 Starting auto-backup system...');

    // İlk backup kontrolü
    await this.checkAndCreateBackup();

    // Application lifecycle'da backup yarat
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.createAutoBackup();
      });

      // Her 24 saatte bir kontrol et
      setInterval(() => {
        this.checkAndCreateBackup();
      }, this.BACKUP_INTERVAL);
    }
  }

  // Son backup'tan bu yana yeterli zaman geçti mi kontrol et
  private async checkAndCreateBackup() {
    const now = Date.now();
    const lastBackup = localStorage.getItem('lastAutoBackup');

    if (!lastBackup || (now - parseInt(lastBackup)) > this.BACKUP_INTERVAL) {
      console.log('📦 Creating automatic backup...');
      await this.createAutoBackup();
      localStorage.setItem('lastAutoBackup', now.toString());
    }
  }

  // Tüm veriyi güvenli şekilde yedekle
  async createAutoBackup(): Promise<void> {
    try {
      // 1. Tüm veriyi topla
      const backupData = await this.exportAllData();

      // 2. Multiple backup stratejisi
      const backupPromises = [
        this.saveToLocalStorage(backupData),  // Fallback storage
        this.offerDownloadBackup(backupData), // Optional download
        this.saveToGoogleDrive(backupData),   // Online backup (varsa)
      ];

      // Paralel çalıştır
      const results = await Promise.allSettled(backupPromises);

      // Sonuçları logla
      results.forEach((result, index) => {
        const method = ['LocalStorage', 'Download', 'Google Drive'][index];
        if (result.status === 'fulfilled') {
          console.log(`✅ ${method} backup successful`);
        } else {
          console.error(`❌ ${method} backup failed:`, result.reason);
        }
      });

      // Başarılı backup timestamp'ini kaydet
      this.lastBackup = Date.now();

      // Küçük notification (hata varsa gösterilir)
      const failedCount = results.filter(r => r.status === 'rejected').length;
      if (failedCount > 0) {
        console.warn(`⚠️ ${failedCount} backup method failed`);
      } else {
        console.log('📦 Backup completed successfully');
      }

    } catch (error) {
      console.error('❌ Full backup failed:', error);
    }
  }

  // Tüm sistemi veri export'u
  async exportAllData(): Promise<BackupData> {
    try {
      // Session'den user email al
      const userEmail = await this.getCurrentUserEmail();
      if (!userEmail) {
        throw new Error('Kullanıcı girişi gerekli');
      }

      const [medicines, medicineHistory] = await Promise.all([
        indexedDBService.getMedicines(userEmail),
        indexedDBService.getMedicineRecords(userEmail),
      ]);

      return {
        version: '1.0',
        createdAt: new Date().toISOString(),
        medicines: medicines || [],
        medicineHistory: medicineHistory || [],
        profiles: [], // Profiles henüz implement edilmemiş
      };
    } catch (error) {
      console.error('❌ Data export failed:', error);
      throw new Error('Yedekleme için veri dışa aktarılamadı');
    }
  }

  // LocalStorage'a küçük yedek (fallback)
  private async saveToLocalStorage(backupData: BackupData): Promise<void> {
    try {
      // Sadece temel bilgileri sakla (localStorage limiti için)
      const lightBackup = {
        ...backupData,
        medicines: backupData.medicines.slice(0, 10), // İlk 10 ilaç
        medicineHistory: backupData.medicineHistory.slice(0, 50), // Son 50 kayıt
      };

      localStorage.setItem('emergency_backup', JSON.stringify(lightBackup));
      console.log('💾 Emergency backup saved to localStorage');
    } catch (error) {
      console.error('LocalStorage backup failed:', error);
      throw error;
    }
  }

  // Google Drive'a upload (online backup)
  private async saveToGoogleDrive(backupData: BackupData): Promise<void> {
    try {
      // Geçerli token alıp içerik sınırla
      const accessToken = await tokenManager.getValidToken();

      const fileName = `ilac_yedek_${new Date().toISOString().split('T')[0]}.json`;

      // Google Drive API ile dosya oluştur/yükle
      const metadata = {
        name: fileName,
        mimeType: 'application/json',
        description: 'İlaç Takip Sistemi Otomatik Yedek',
      };

      const fileContent = JSON.stringify(backupData, null, 2);

      // Multipart request oluştur
      const boundary = '----MedicalBackup' + Date.now();
      const multipartRequestBody = this.createMultipartRequest(
        metadata,
        fileContent,
        boundary
      );

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!response.ok) {
        throw new Error('Google Drive upload failed');
      }

      const result = await response.json();
      localStorage.setItem('lastDriveBackup', JSON.stringify({
        fileId: result.id,
        timestamp: Date.now(),
      }));

      console.log('☁️ Backup saved to Google Drive:', result.id);

    } catch (error) {
      console.error('Google Drive backup failed:', error);
      // Fail silently - online backup optional
      throw error; // Promise.allSettled bunu handle eder
    }
  }

  // Multipart request için required helper
  private createMultipartRequest(metadata: any, fileContent: string, boundary: string): string {
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    const metadataPart = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata);

    const filePart = "\r\n--" + boundary + "\r\n" +
      'Content-Type: application/json\r\n\r\n' +
      fileContent;

    return metadataPart + filePart + closeDelimiter;
  }

  // Kullanıcıya manual download sun
  private async offerDownloadBackup(backupData: BackupData): Promise<void> {
    return new Promise((resolve) => {
      try {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: 'application/json'
        });

        // Browser download API
        if (typeof window !== 'undefined' && 'navigator' in window) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.DOWNLOAD_FILE_NAME;
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);

          console.log('📄 Manual backup download initiated');
          resolve();
        } else {
          resolve(); // Non-browser environment
        }
      } catch (error) {
        console.error('Download backup failed:', error);
        resolve(); // Don't fail the entire backup
      }
    });
  }

  // Manual backup örneği girdi
  async manualBackup(): Promise<string> {
    console.log('🔄 Creating manual backup...');
    const backupData = await this.exportAllData();
    await this.offerDownloadBackup(backupData);
    return 'Manual backup created and downloadable';
  }

  // JSON file'dan import backup
  async restoreFromBackup(file: File): Promise<string> {
    try {
      console.log('📥 Restoring from backup file...');

      const fileContent = await file.text();
      const backupData: BackupData = JSON.parse(fileContent);

      // Version kontrolü
      if (!backupData.version || backupData.version !== '1.0') {
        throw new Error('Uyumsuz yedek dosyası versiyonu');
      }

      // Verileri geri yükle
      await this.importBackupData(backupData);

      console.log('✅ Backup restoration completed');
      return `Yedek başarıyla geri yüklendi. (${backupData.createdAt})`;

    } catch (error) {
      console.error('Backup restoration failed:', error);
      throw new Error('Yedek geri yüklenirken hata oluştu');
    }
  }

  // Backup verilerini DB'ye import et
  private async importBackupData(backupData: BackupData): Promise<void> {
    try {
      const userEmail = await this.getCurrentUserEmail();
      if (!userEmail) throw new Error('User not authenticated');

      // İlaçları import et
      for (const medicine of backupData.medicines) {
        await indexedDBService.addMedicine(medicine);
      }

      // Geçmişi import et (addMedicineRecord kullan)
      for (const record of backupData.medicineHistory) {
        await indexedDBService.addMedicineRecord(record);
      }

      // Profilleri import et (şimdilik skip - henüz implement edilmemiş)
      if (backupData.profiles && backupData.profiles.length > 0) {
        console.warn('⚠️ Profile import skipped - not implemented yet');
      }

      console.log('📊 Imported:', backupData.medicines.length, 'medicines,',
        backupData.medicineHistory.length, 'records');

    } catch (error) {
      console.error('Data import error:', error);
      throw error;
    }
  }

  // Backup durumunu kontrol et
  getBackupStatus() {
    const lastLocal = localStorage.getItem('lastAutoBackup');
    const lastDrive = localStorage.getItem('lastDriveBackup');

    return {
      lastAutoBackup: lastLocal ? new Date(parseInt(lastLocal)).toLocaleString('tr-TR') : null,
      lastDriveBackup: lastDrive ? JSON.parse(lastDrive).timestamp : null,
      timeSinceLastBackup: lastLocal ? Date.now() - parseInt(lastLocal) : null,
      nextScheduledBackup: lastLocal ?
        new Date(parseInt(lastLocal) + this.BACKUP_INTERVAL).toLocaleString('tr-TR') : null,
    };
  }

  // Acil durum yedeği mevcut mu?
  hasEmergencyBackup(): boolean {
    return !!localStorage.getItem('emergency_backup');
  }

  // Acil durum yedeğini geri yükle
  async restoreEmergencyBackup(): Promise<void> {
    try {
      const emergencyData = localStorage.getItem('emergency_backup');
      if (!emergencyData) {
        throw new Error('Acil durum yedeği bulunamadı');
      }

      const backupData = JSON.parse(emergencyData);
      await this.importBackupData(backupData);

      console.log('🚨 Emergency backup restored');
    } catch (error) {
      console.error('Emergency backup restore failed:', error);
      throw error;
    }
  }
}

export const backupManager = new BackupManager();

// Global error handler for emergency backup
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('💥 Critical error occurred, auto-backup triggered');
    backupManager.manualBackup().catch(console.error);
  });
}
