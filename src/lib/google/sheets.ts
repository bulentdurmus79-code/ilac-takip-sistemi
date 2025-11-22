import { google } from 'googleapis';
import { IlacSheetData, IlacGecmisSheetData } from '@/types/sheets';

export class SheetsService {
  private static instance: SheetsService;

  public static getInstance(): SheetsService {
    if (!SheetsService.instance) {
      SheetsService.instance = new SheetsService();
    }
    return SheetsService.instance;
  }

  async getAuthenticatedClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.sheets({ version: 'v4', auth: oauth2Client });
  }

  async readSheet(spreadsheetId: string, sheetName: string, accessToken: string, range?: string) {
    const sheets = await this.getAuthenticatedClient(accessToken);
    const fullRange = range || `${sheetName}!A:Z`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange,
    });
    return response.data.values || [];
  }

  async appendToSheet(spreadsheetId: string, sheetName: string, accessToken: string, data: string[][]) {
    const sheets = await this.getAuthenticatedClient(accessToken);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: {
        values: data,
      },
    });
  }

  async addMedicine(spreadsheetId: string, medicine: IlacSheetData, accessToken: string) {
    const data = [[
      medicine.ilac_id,
      medicine.ilac_adi,
      medicine.doz,
      medicine.birim,
      medicine.zamanlar,
      medicine.stok.toString(),
      medicine.foto_url,
      medicine.kullanici_email,
      medicine.aktif.toString(),
      medicine.olusturma_tarih,
    ]];
    await this.appendToSheet(spreadsheetId, 'ilaclar', accessToken, data);
  }

  async getMedicines(spreadsheetId: string, accessToken: string, userEmail: string): Promise<IlacSheetData[]> {
    const rows = await this.readSheet(spreadsheetId, 'ilaclar', accessToken);
    return rows.slice(1).map((row: string[]) => ({
      ilac_id: row[0],
      ilac_adi: row[1],
      doz: row[2],
      birim: row[3],
      zamanlar: row[4],
      stok: parseInt(row[5] || '0'),
      foto_url: row[6],
      kullanici_email: row[7],
      aktif: row[8] === 'TRUE',
      olusturma_tarih: row[9],
    })).filter((med: IlacSheetData) => med.kullanici_email === userEmail && med.aktif);
  }

  async addMedicationRecord(spreadsheetId: string, record: IlacGecmisSheetData, accessToken: string) {
    const data = [[
      record.kayit_id,
      record.ilac_id,
      record.tarih,
      record.saat,
      record.durum,
      record.erteleme_dk?.toString(),
      record.not,
      record.sync.toString(),
      record.timestamp.toString(),
    ]];
    await this.appendToSheet(spreadsheetId, 'ilac_gecmis', accessToken, data);
  }
}

export const sheetsService = SheetsService.getInstance();
