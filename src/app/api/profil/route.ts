import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/google/auth';
import { sheetsService } from '@/lib/google/sheets';
import { indexedDBService } from '@/lib/db/indexeddb';
import { KullaniciSheetData } from '@/types/sheets';

// GET - Kullanıcı profili
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

    // Read profile from Google Sheets
    const profileRows = await sheetsService.readSheet(spreadsheetId, 'kullanici', session.accessToken);
    const userProfile = profileRows.slice(1).find((row: string[]) => row[0] === userEmail);

    if (userProfile) {
      const profile: KullaniciSheetData = {
        kullanici_email: userProfile[0],
        isim: userProfile[1],
        soyisim: userProfile[2],
        cinsiyet: userProfile[3],
        yas: parseInt(userProfile[4] || '65'),
        hastaliklar: userProfile[5],
        api_key_area: userProfile[6] || '',
        olusturma_tarihi: userProfile[7],
      };

      return NextResponse.json({ profile });
    } else {
      return NextResponse.json({ profile: null });
    }
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Profil kaydet/güncelle
export async function POST(request: NextRequest) {
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

    const { isim, soyisim, cinsiyet, yas, hastaliklar }: {
      isim: string;
      soyisim: string;
      cinsiyet: string;
      yas: number;
      hastaliklar: string;
    } = await request.json();

    // Validate required fields
    if (!isim || !soyisim) {
      return NextResponse.json({ error: 'İsim ve soyisim zorunludur' }, { status: 400 });
    }

    // Check if profile exists first
    const profileRows = await sheetsService.readSheet(spreadsheetId, 'kullanici', session.accessToken);
    const existingProfileIndex = profileRows.findIndex((row: string[], index: number) => index > 0 && row[0] === userEmail);

    const profileData: KullaniciSheetData = {
      kullanici_email: userEmail,
      isim,
      soyisim,
      cinsiyet,
      yas,
      hastaliklar,
      api_key_area: '', // Can be filled later by user
      olusturma_tarihi: new Date().toISOString().split('T')[0],
    };

    if (existingProfileIndex > 0) {
      // Update existing profile - we would need to update the specific row
      // For now, we'll append as a new row (simplified approach)
    }

    // Add/Update profile in Google Sheets
    const data = [[
      profileData.kullanici_email,
      profileData.isim,
      profileData.soyisim,
      profileData.cinsiyet,
      profileData.yas.toString(),
      profileData.hastaliklar,
      profileData.api_key_area,
      profileData.olusturma_tarihi,
    ]];

    await sheetsService.appendToSheet(spreadsheetId, 'kullanici', session.accessToken, data);

    // Store in IndexedDB for fast access
    await indexedDBService.addMedicine({
      ilac_id: 'profile',
      ilac_adi: '',
      doz: '',
      birim: '',
      zamanlar: '',
      stok: 0,
      foto_url: '',
      kullanici_email: userEmail,
      aktif: true,
      olusturma_tarih: '',
    }); // This is a hack, we need to extend IndexedDB for profile

    return NextResponse.json({ success: true, profile: profileData });
  } catch (error) {
    console.error('Profil kaydetme hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
