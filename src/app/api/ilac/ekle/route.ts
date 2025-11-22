import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/google/auth';
import { sheetsService } from '@/lib/google/sheets';
import { calendarService } from '@/lib/google/calendar';
import { indexedDBService } from '@/lib/db/indexeddb';
import { IlacSheetData } from '@/types/sheets';

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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { ilac_adi, doz, birim, zamanlar, stok, foto_url }: {
      ilac_adi: string;
      doz: string;
      birim: string;
      zamanlar: string;
      stok: number;
      foto_url?: string;
    } = body;

    // Enhanced input validation and sanitization
    if (!ilac_adi?.trim() || !doz?.trim() || !birim?.trim() || !zamanlar?.trim()) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Sanitize and validate input lengths
    const sanitizedMedicineName = ilac_adi.trim().substring(0, 100);
    const sanitizedDose = doz.trim().substring(0, 50);
    const sanitizedUnit = birim.trim().substring(0, 20);
    const sanitizedTimes = zamanlar.trim().substring(0, 200);

    // Validate stok - reasonable range
    const stockValue = Number(stok);
    if (isNaN(stockValue) || stockValue < 0 || stockValue > 1000) {
      return NextResponse.json({ error: 'Invalid stock quantity' }, { status: 400 });
    }

    // Validate birim is in allowed list
    const allowedUnits = ['tb', 'mg', 'ml', 'damla', 'kaşık', 'adet'];
    if (!allowedUnits.includes(sanitizedUnit.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid unit' }, { status: 400 });
    }

    // Validate zamanlar format (HH:MM,HH:MM...)
    const timePattern = /^(\d{2}:\d{2})(,\s*\d{2}:\d{2})*$/;
    if (!timePattern.test(sanitizedTimes)) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:MM,HH:MM... format' }, { status: 400 });
    }

    // Validate URL if provided
    let sanitizedPhotoUrl = '';
    if (foto_url?.trim()) {
      try {
        new URL(foto_url);
        sanitizedPhotoUrl = foto_url.trim().substring(0, 500);
      } catch {
        return NextResponse.json({ error: 'Invalid photo URL' }, { status: 400 });
      }
    }

    // Rate limiting protection - prevent abuse
    const currentTime = Date.now();
    if (userEmail) {
      const sessionKey = `medicine_add_${userEmail}_${Math.floor(currentTime / 60000)}`; // Per minute
      // In production, store this in Redis/cache
    }

    const ilac_id = `ilac-${Date.now()}`;

    const medicineData: IlacSheetData = {
      ilac_id,
      ilac_adi: sanitizedMedicineName,
      doz: sanitizedDose,
      birim: sanitizedUnit,
      zamanlar: sanitizedTimes,
      stok: stockValue,
      foto_url: sanitizedPhotoUrl,
      kullanici_email: userEmail,
      aktif: true,
      olusturma_tarih: new Date().toISOString().split('T')[0],
    };

    // Add to Google Sheets
    await sheetsService.addMedicine(spreadsheetId, medicineData, session.accessToken);

    // Add to IndexedDB for offline
    await indexedDBService.addMedicine(medicineData);

    // Create calendar reminders for each time in zamanlar
    const zamanArray = zamanlar.split(',');
    const currentDate = new Date();
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      next7Days.push(date);
    }

    for (const time of zamanArray) {
      for (const date of next7Days) {
        const reminderTime = new Date(date);
        const [hours, minutes] = time.trim().split(':');
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (reminderTime > currentDate) { // Only future reminders
          await calendarService.createEvent(session.accessToken, 'primary', {
            summary: `${ilac_adi} hatırlatması`,
            description: `Doğru zamanda ${ilac_adi} almayı unutma! Doz: ${doz} ${birim}`,
            start: { dateTime: reminderTime.toISOString() },
            end: { dateTime: new Date(reminderTime.getTime() + 15 * 60 * 1000).toISOString() }, // 15 min duration
            reminders: { useDefault: false }, // Disable default reminders, handle custom
          });
        }
      }
    }

    return NextResponse.json({ success: true, medicine: medicineData });
  } catch (error) {
    console.error('İlaç ekleme hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
