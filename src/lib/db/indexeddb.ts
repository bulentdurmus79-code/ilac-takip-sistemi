import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { IlacSheetData, IlacGecmisSheetData, KanSekeriSheetData, TansiyonSheetData, DigerOlcumSheetData } from '@/types/sheets';

interface MedicationTrackerDB extends DBSchema {
  medicines: {
    key: string;
    value: IlacSheetData;
    indexes: {
      'byEmail': string;
    };
  };
  medicineRecords: {
    key: string;
    value: IlacGecmisSheetData;
    indexes: {
      'byMedicine': string;
      'byDate': string;
      'byEmail': string;
    };
  };
  bloodSugarRecords: {
    key: string;
    value: KanSekeriSheetData;
  };
  bloodPressureRecords: {
    key: string;
    value: TansiyonSheetData;
  };
  otherMeasurements: {
    key: string;
    value: DigerOlcumSheetData;
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: string;
      data: any;
      timestamp: number;
    };
  };
}

class IndexedDBService {
  private dbPromise!: Promise<IDBPDatabase<MedicationTrackerDB>>;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  private initDB() {
    this.dbPromise = openDB<MedicationTrackerDB>('medication-tracker', 1, {
      upgrade(db) {
        // Medicines table
        if (!db.objectStoreNames.contains('medicines')) {
          const medicineStore = db.createObjectStore('medicines', { keyPath: 'ilac_id' });
          medicineStore.createIndex('byEmail', 'kullanici_email');
        }

        // Medicine records table
        if (!db.objectStoreNames.contains('medicineRecords')) {
          const recordStore = db.createObjectStore('medicineRecords', { keyPath: 'kayit_id' });
          recordStore.createIndex('byMedicine', 'ilac_id');
          recordStore.createIndex('byDate', 'tarih');
          recordStore.createIndex('byEmail', 'kullanici_email');
        }

        // Other tables can be added as needed...
      },
    });
  }

  async addMedicine(medicine: IlacSheetData) {
    const db = await this.dbPromise;
    await db.add('medicines', medicine);
  }

  async getMedicines(userEmail: string): Promise<IlacSheetData[]> {
    const db = await this.dbPromise;
    const currencies = await db.getAllFromIndex('medicines', 'byEmail', userEmail);
    return currencies;
  }

  async updateMedicine(medicine: IlacSheetData) {
    const db = await this.dbPromise;
    await db.put('medicines', medicine);
  }

  async deleteMedicine(ilacId: string) {
    const db = await this.dbPromise;
    await db.delete('medicines', ilacId);
  }

  async addMedicineRecord(record: IlacGecmisSheetData) {
    const db = await this.dbPromise;
    await db.add('medicineRecords', record);
  }

  async getMedicineRecords(userEmail: string): Promise<IlacGecmisSheetData[]> {
    const db = await this.dbPromise;
    const records = await db.getAllFromIndex('medicineRecords', 'byEmail', userEmail);
    return records;
  }

  async getUnsyncedRecords(): Promise<any[]> {
    // Simplified: return records that need sync
    const db = await this.dbPromise;
    const allRecords = await db.getAll('medicineRecords');
    return allRecords.filter(record => !record.sync);
  }

  async markAsSynced(recordId: string) {
    const db = await this.dbPromise;
    const record = await db.get('medicineRecords', recordId);
    if (record) {
      record.sync = true;
      await db.put('medicineRecords', record);
    }
  }
}

export const indexedDBService = new IndexedDBService();
