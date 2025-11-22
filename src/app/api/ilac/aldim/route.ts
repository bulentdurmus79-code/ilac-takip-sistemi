import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/google/auth';
import { sheetsService } from '@/lib/google/sheets';
import { calendarService } from '@/lib/google/calendar';
import { indexedDBService } from '@/lib/db/indexeddb';
import { IlacGecmisSheetData } from '@/types/sheets';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 500 });
    }

    const { ilac_id, tarih, saat, erteleme_dk }: {
      ilac_id: string;
      tarih?: string;
      saat?: string;
      erteleme_dk?: number;
    } = await request.json();

    if (!ilac_id) {
      return NextResponse.json({ error: 'İlaç ID gerekli' }, { status: 400 });
    }

    const now = new Date();
    const record: IlacGecmisSheetData = {
      kayit_id: `kg-${Date.now()}`,
      ilac_id,
      tarih: tarih || now.toISOString().split('T')[0],
      saat: saat || `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      durum: 'alindi',
      erteleme_dk: erteleme_dk || 0,
      not: '',
      sync: true,
      timestamp: now.getTime(),
    };

    // Add record to Sheets
    await sheetsService.addMedicationRecord(spreadsheetId, record, session.accessToken);

    // Add to IndexedDB for offline
    await indexedDBService.addMedicineRecord(record);

    // Get medicine details to update stock and get reminder info
    const medicines = await sheetsService.getMedicines(spreadsheetId, session.accessToken, userEmail);
    const medicine = medicines.find(m => m.ilac_id === ilac_id);

    if (medicine && medicine.stok > 0) {
      // Decrease stock
      const updatedMedicine = { ...medicine, stok: medicine.stok - 1 };
      // We would need to update the sheet row, but for simplicity, assume handled elsewhere

      // Add to IndexedDB
      await indexedDBService.updateMedicine(updatedMedicine);
    }

    // Schedule next reminder if there's stock and time info
    if (medicine && medicine.zamanlar) {
      const currentTime = new Date();
      const tomorrow = new Date(currentTime);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const zamanArray = medicine.zamanlar.split(',');
      const nextTime = zamanArray[0]?.trim(); // Use first time for next day

      if (nextTime) {
        const [hours, minutes] = nextTime.split(':');
        const nextReminder = new Date(tomorrow);
        nextReminder.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        await calendarService.createEvent(session.accessToken, 'primary', {
          summary: `${medicine.ilac_adi} hatırlatması (Sonraki)`,
          description: `Yarın ${medicine.ilac_adi} almayı unutma! Doz: ${medicine.doz} ${medicine.birim}`,
          start: { dateTime: nextReminder.toISOString() },
          end: { dateTime: new Date(nextReminder.getTime() + 15 * 60 * 1000).toISOString() },
          reminders: { useDefault: false },
        });
      }
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('İlaç alındı hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
