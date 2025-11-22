import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/google/auth';
import { sheetsService } from '@/lib/google/sheets';

export async function GET(request: NextRequest) {
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

    const medicines = await sheetsService.getMedicines(spreadsheetId, session.accessToken, userEmail);

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error('İlaç listesi alınırken hata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
