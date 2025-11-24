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
        sheet_id: userProfile[6] || '', // Personal spreadsheet ID
        api_key_area: userProfile[7] || '',
        olusturma_tarihi: userProfile[8],
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
    console.log('🔍 Profil API çağrısı başladı');

    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken || !session.user?.email) {
      console.log('❌ Session validation failed:', { hasSession: !!session, hasToken: !!session?.accessToken, hasEmail: !!session?.user?.email });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    console.log('📊 Spreadsheet ID:', spreadsheetId ? 'configured' : 'missing');

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 500 });
    }

    const { isim, soyisim, cinsiyet, yas, hastaliklar, sheet_id }: {
      isim: string;
      soyisim: string;
      cinsiyet: string;
      yas: number;
      hastaliklar: string;
      sheet_id?: string;
    } = await request.json();

    // Validate required fields
    if (!isim || !soyisim) {
      return NextResponse.json({ error: 'İsim ve soyisim zorunludur' }, { status: 400 });
    }

    // 🆕 EĞER sheet_id varsa kullanıcının kişisel sheet'ini kullan
    let targetSpreadsheetId = spreadsheetId;
    if (sheet_id) {
      targetSpreadsheetId = sheet_id;  // Kullanıcının kendi sheet'i
    }

    console.log('🎯 Target Sheet ID:', targetSpreadsheetId);
    console.log('👤 User Email:', userEmail);

    // Check if profile exists first
    console.log('📖 Reading sheet data...');
    const profileRows = await sheetsService.readSheet(targetSpreadsheetId, 'kullanici', session.accessToken);
    console.log('📖 Read completed, rows found:', profileRows?.length);

    const existingProfileIndex = profileRows.findIndex((row: string[], index: number) => index > 0 && row[0] === userEmail);
    console.log('👤 Existing profile index:', existingProfileIndex);

    const profileData: KullaniciSheetData = {
      kullanici_email: userEmail,
      isim,
      soyisim,
      cinsiyet,
      yas,
      hastaliklar,
      sheet_id: sheet_id || '', // Store personal spreadsheet ID
      api_key_area: '',
      olusturma_tarihi: new Date().toISOString().split('T')[0],
    };

    if (existingProfileIndex > 0) {
      // Update existing profile - we would need to update the specific row
      // For now, we'll append as a new row (simplified approach)
    }

    // Add/Update profile in Google Sheets (now 9 columns)
    const data = [[
      profileData.kullanici_email,
      profileData.isim,
      profileData.soyisim,
      profileData.cinsiyet,
      profileData.yas.toString(),
      profileData.hastaliklar,
      profileData.sheet_id,
      profileData.api_key_area,
      profileData.olusturma_tarihi,
    ]];

    console.log('📝 Preparing data for append:', data);
    console.log('ℹ️ Tab name: kullanici, Sheet ID:', targetSpreadsheetId);

    console.log('💾 Starting append operation...');
    await sheetsService.appendToSheet(targetSpreadsheetId, 'kullanici', session.accessToken, data);
    console.log('✅ Append operation completed!');

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
