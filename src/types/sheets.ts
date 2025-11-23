export interface IlacSheetData {
  ilac_id: string;
  ilac_adi: string;
  doz: string;
  birim: string;
  zamanlar: string;
  stok: number;
  foto_url: string;
  kullanici_email: string;
  aktif: boolean;
  olusturma_tarih: string;
}

export interface IlacGecmisSheetData {
  kayit_id: string;
  ilac_id: string;
  tarih: string;
  saat: string;
  durum: string;
  erteleme_dk: number;
  not: string;
  sync: boolean;
  timestamp: number;
}

export interface KanSekeriSheetData {
  kayit_id: string;
  tarih: string;
  saat: string;
  deger: number;
  tur: string;
  normal: boolean;
  not: string;
  sync: boolean;
  timestamp: number;
}

export interface TansiyonSheetData {
  kayit_id: string;
  tarih: string;
  saat: string;
  sistolik: number;
  diyastolik: number;
  nabiz: number;
  normal: boolean;
  not: string;
  sync: boolean;
  timestamp: number;
}

export interface DigerOlcumSheetData {
  kayit_id: string;
  tarih: string;
  saat: string;
  tip: string;
  deger: number;
  birim: string;
  normal: boolean;
  not: string;
  sync: boolean;
  timestamp: number;
}

export interface KullaniciSheetData {
  kullanici_email: string;
  isim: string;
  soyisim: string;
  cinsiyet: string;
  yas: number;
  hastaliklar: string;
  sheet_id: string; // User's personal Google Sheets ID
  api_key_area: string; // User's personal API key storage
  olusturma_tarihi: string;
}

export interface SyncKuyrukSheetData {
  offline_id: string;
  tip: string;
  data_json: string;
  timestamp: number;
  islendi: boolean;
  islem_tarihi: string;
}
