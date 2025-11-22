import { indexedDBService } from './indexeddb';
import { sheetsService } from '../google/sheets';

class SyncService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  async syncAllPendingData(accessToken: string, spreadsheetId: string) {
    if (!this.isOnline) return;

    try {
      const unsyncedRecords = await indexedDBService.getUnsyncedRecords();

      for (const record of unsyncedRecords) {
        try {
          await sheetsService.addMedicationRecord(spreadsheetId, record, accessToken);
          await indexedDBService.markAsSynced(record.kayit_id);
        } catch (error) {
          console.error('Failed to sync record:', record.kayit_id, error);
          // Could retry later or mark for retry
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Register background sync if supported
  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in (navigator as any).serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('medication-sync');
      } catch (error) {
        console.log('Background sync not supported');
      }
    }
  }

  async addToSyncQueue(item: { type: string; data: any }) {
    // Store in IndexedDB sync queue
    // This could be expanded to handle more types
    const db = await indexedDBService as any; // Assuming we add syncQueue methods
    await db.addSyncItem({
      id: Date.now().toString(),
      ...item,
      timestamp: Date.now(),
    });
  }
}

export const syncService = new SyncService();
