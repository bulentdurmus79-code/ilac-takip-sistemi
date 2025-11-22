import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/google/auth';
import { sheetsService } from '@/lib/google/sheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 500 });
    }

    // Read medicine records from Google Sheets
    const recordsRows = await sheetsService.readSheet(spreadsheetId, 'ilac_gecmis', session.accessToken);
    const userRecords = recordsRows.slice(1).map((row: string[]) => ({
      kayit_id: row[0],
      ilac_id: row[1],
      tarih: row[2],
      saat: row[3],
      durum: row[4],
      erteleme_dk: parseInt(row[5] || '0'),
      not: row[6],
      sync: row[7] === 'TRUE',
      timestamp: parseInt(row[8] || '0'),
    })).filter((record: any) => record.ilac_id); // Filter out empty rows

    return NextResponse.json({ records: userRecords });
  } catch (error) {
    console.error('İlaç kayıtları alınırken hata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
