export interface Ilac {
  ilac_id: string;
  ilac_adi: string;
  doz: string; // e.g., "500mg", "2 tablet"
  birim: string; // "tb", "mg", etc.
  zamanlar: string; // "09:00,15:00,21:00"
  stok: number;
  foto_url?: string;
  kullanici_email: string;
  aktif: boolean;
  olusturma_tarih: string;
}

export interface IlacKayit {
  kayit_id: string;
  ilac_id: string;
  tarih: string; // YYYY-MM-DD
  saat: string; // HH:MM
  durum: "alindi" | "hatirlatici";
  erteleme_dk?: number;
  not?: string;
  sync: boolean;
  timestamp: number;
}

export interface Olcum {
  kayit_id: string;
  tarih: string;
  saat: string;
  deger: number;
  birim: string;
  tur?: string; // "aclak", "toklu" for blood sugar
  normal: boolean;
  not?: string;
  sync: boolean;
  timestamp: number;
}
