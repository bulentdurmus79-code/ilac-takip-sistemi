import { indexedDBService } from './indexeddb';
import { sheetsService } from '../google/sheets';
import jwt from 'jsonwebtoken';

// Advanced Sync Manager - Öncelikli önerilerden biri
interface SyncOperation {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  synced: boolean;
}

class SyncManager {
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processSyncQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  async addToQueue(operation: SyncOperation) {
    // Önce local'e kaydet
    await this.saveLocally(operation);

    // Queue'ya ekle
    this.syncQueue.push(operation);

    // Online'sa hemen sync et
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private async saveLocally(operation: SyncOperation) {
    // İlacı local DB'ye kaydet
    if (operation.table === 'medicines') {
      await indexedDBService.addMedicine({
        ...operation.data,
        kayit_id: operation.id,
        olusturma_tarih: new Date().toISOString(),
      });
    }
  }

  private async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;

    // FIFO mantığı ile işle
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue[0];

      try {
        // Operations.execute operation
        await this.syncToServer(operation);
        this.syncQueue.shift(); // Başarılı, kuyruktan çıkar
      } catch (error) {
        operation.retryCount++;

        // 3 denemeden sonra başarısızsa, kullanıcıya bildir
        if (operation.retryCount >= 3) {
          this.notifySyncFailed(operation);
          this.syncQueue.shift(); // Kuyruktan çıkar
        } else {
          break; // Daha sonra tekrar dene
        }
      }
    }

    this.isSyncing = false;
  }

  private async syncToServer(operation: SyncOperation) {
    // Burada Google Sheets'e sync ederiz gelecekte
    // Şimdilik sadece console log
    console.log('🔄 Syncing to server:', operation);

    // Mock successful sync
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private notifySyncFailed(operation: SyncOperation) {
    console.error('❌ Sync failed after 3 retries:', operation);
    // Could show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('İlaç Takip', {
        body: 'Bazı veriler eşlenemedi, internete bağlandığınızda tekrar dene',
        icon: '/icon-192.png'
      });
    }
  }

  // Bulk sync remaining items
  async syncRemainingItems() {
    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.syncQueue.length,
      isSyncing: this.isSyncing,
      isOnline: this.isOnline
    };
  }
}

export const syncManager = new SyncManager();
