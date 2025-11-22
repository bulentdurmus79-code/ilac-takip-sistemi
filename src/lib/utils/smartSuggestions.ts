// Sesli bildirim ve akıllı öneriler için yardımcı sınıflar - Ücretsiz tarayıcı API'leri ile

export interface SmartSuggestion {
  id: string;
  type: 'medicine' | 'health' | 'stock' | 'reminder';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    href: string;
  };
  timestamp: number;
}

export class SmartSuggestionsService {
  private static instance: SmartSuggestionsService;

  public static getInstance(): SmartSuggestionsService {
    if (!SmartSuggestionsService.instance) {
      SmartSuggestionsService.instance = new SmartSuggestionsService();
    }
    return SmartSuggestionsService.instance;
  }

  // Stok seviyesi önerileri
  generateStockSuggestions(medicines: any[]): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    medicines.forEach((medicine: any) => {
      if (medicine.stok === 0) {
        suggestions.push({
          id: `stock-${medicine.ilac_id}-out`,
          type: 'stock',
          title: `${medicine.ilac_adi} tükendi!`,
          description: `${medicine.ilac_adi} ilacı tamamen tükendi. Doktorunuzdan yeni reçete alın.`,
          priority: 'high',
          action: {
            label: 'Yeni Reçete',
            href: '/ilaclar/ekle'
          },
          timestamp: Date.now()
        });
      } else if (medicine.stok === 1) {
        suggestions.push({
          id: `stock-${medicine.ilac_id}-critical`,
          type: 'stock',
          title: 'Son ilaç!',
          description: `${medicine.ilac_adi} için sadece 1 adet kaldı. Eczaneden yeni ilaç temin edin.`,
          priority: 'high',
          action: {
            label: 'Eczane Bul',
            href: 'tel:112'
          },
          timestamp: Date.now()
        });
      } else if (medicine.stok < 3) {
        suggestions.push({
          id: `stock-${medicine.ilac_id}-low`,
          type: 'stock',
          title: 'Stok azaldı',
          description: `${medicine.ilac_adi} için ${medicine.stok} adet kaldı. Yeni ilaç almayı düşünün.`,
          priority: 'medium',
          action: {
            label: 'İlaç Bilgilerini Güncelle',
            href: '/ilaclar'
          },
          timestamp: Date.now()
        });
      }
    });

    return suggestions;
  }

  // Sağlık trend önerileri - Temel algoritma
  generateHealthSuggestions(healthRecords: any[], userProfile: any): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    // Kan şekeri trend analizi
    const bloodSugarRecords = healthRecords.filter((r: any) => r.kayit_id.startsWith('ks-'));
    if (bloodSugarRecords.length > 3) {
      const recent = bloodSugarRecords.slice(-3);
      const avg = recent.reduce((sum: number, r: any) => sum + r.deger, 0) / recent.length;

      if (avg > 180) {
        suggestions.push({
          id: 'health-bs-high',
          type: 'health',
          title: 'Kan şekeri yüksek!',
          description: `Son ölçümlerde ortalama kan şekeri ${avg.toFixed(0)} mg/dL. Doktorunuzu bilgilendirin.`,
          priority: 'high',
          action: {
            label: 'Acil Durum',
            href: 'tel:112'
          },
          timestamp: Date.now()
        });
      }
    }

    // Tansiyon trend analizi
    const bloodPressureRecords = healthRecords.filter((r: any) => r.kayit_id.startsWith('tn-'));
    if (bloodPressureRecords.length > 3) {
      const recent = bloodPressureRecords.slice(-3);
      const avgSys = recent.reduce((sum: number, r: any) => sum + r.sistolik, 0) / recent.length;

      if (avgSys > 140) {
        suggestions.push({
          id: 'health-bp-high',
          type: 'health',
          title: 'Tansiyon yüksek',
          description: `Ortalama tansiyon: ${avgSys.toFixed(0)}/90 mmHg üzeri. Doktor danışın.`,
          priority: 'high',
          action: {
            label: 'Doktor Araşı',
            href: 'tel:112'
          },
          timestamp: Date.now()
        });
      }
    }

    return suggestions;
  }

  // Hatırlatma önerileri
  generateReminderSuggestions(medicineRecords: any[], medicines: any[]): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    const today = new Date().toISOString().split('T')[0];

    // Geç kalan ilaç uyarıları
    medicines.forEach((medicine: any) => {
      const todaysRecords = medicineRecords.filter((r: any) =>
        r.ilac_id === medicine.ilac_id && r.tarih === today
      );

      if (todaysRecords.length === 0) {
        const zamanlar = medicine.zamanlar.split(',');
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();

        zamanlar.forEach((timeStr: string) => {
          const [hours, mins] = timeStr.trim().split(':').map(Number);
          const medicineMins = hours * 60 + mins;

          if (currentMins > medicineMins + 15) {
            suggestions.push({
              id: `reminder-${medicine.ilac_id}-${timeStr}`,
              type: 'reminder',
              title: `${medicine.ilac_adi} kaçırıldı!`,
              description: `${timeStr} saatinde ${medicine.doz} ${medicine.ilac_adi} alınması gerekiyordu.`,
              priority: 'high',
              action: {
                label: 'Şimdi Al',
                href: `/al?id=${medicine.ilac_id}`
              },
              timestamp: Date.now()
            });
          }
        });
      }
    });

    return suggestions;
  }

  // Genel yaşam tarzı önerileri
  generateLifestyleSuggestions(userProfile: any): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    if (userProfile.hastaliklar) {
      const diseases = userProfile.hastaliklar.toLowerCase();

      if (diseases.includes('hipertansiyon') || diseases.includes('tansiyon')) {
        suggestions.push({
          id: 'lifestyle-bp',
          type: 'health',
          title: 'Tansiyon İçin İpuçları',
          description: 'Tuz tüketimini azaltın, düzenli yürüyüş yapın.',
          priority: 'low',
          action: {
            label: 'Bilgi Al',
            href: '/kurulum'
          },
          timestamp: Date.now()
        });
      }

      if (diseases.includes('diyabet')) {
        suggestions.push({
          id: 'lifestyle-diabetes',
          type: 'health',
          title: 'Şeker Hastalığı İpuçları',
          description: 'Düzenli öğün saatleri çok önemli. Doğru beslenme kritik.',
          priority: 'low',
          action: {
            label: 'Beslenme Rehberi',
            href: '/kurulum'
          },
          timestamp: Date.now()
        });
      }
    }

    // Yaş bazlı öneriler
    if (userProfile.yas > 65) {
      suggestions.push({
        id: 'lifestyle-aging',
        type: 'reminder',
        title: 'Düzenli Sağlık Kontrolü',
        description: '65+ yaş için yıllık sağlık kontrolü kritik öneme sahip.',
        priority: 'low',
        action: {
          label: 'Rand. Hatırlat',
          href: '/kurulum'
        },
        timestamp: Date.now()
      });
    }

    return suggestions;
  }

  // Tüm önerileri birleştir - Ücretsiz ML olmadan - Güvenlik kontrolü ile
  getAllSuggestions(medicines: any[] = [], medicineRecords: any[] = [], healthRecords: any[] = [], userProfile: any = {}): SmartSuggestion[] {
    // Input validation and sanitization
    if (!Array.isArray(medicines) || !Array.isArray(medicineRecords)) {
      return [];
    }

    // Sanitize medicine data
    const sanitizedMedicines = medicines.filter(med =>
      med?.ilac_adi && typeof med.ilac_adi === 'string' &&
      med?.stok !== undefined && typeof med.stok === 'number'
    );

    // Sanitize medicine records
    const sanitizedRecords = medicineRecords.filter(rec =>
      rec?.ilac_id && typeof rec.ilac_id === 'string' &&
      rec?.tarih && typeof rec.tarih === 'string'
    );

    const suggestions: SmartSuggestion[] = [
      ...this.generateStockSuggestions(sanitizedMedicines),
      ...this.generateHealthSuggestions(healthRecords, userProfile),
      ...this.generateReminderSuggestions(sanitizedRecords, sanitizedMedicines),
      ...this.generateLifestyleSuggestions(userProfile)
    ].filter(suggestion =>
      suggestion.type &&
      suggestion.title && typeof suggestion.title === 'string' &&
      suggestion.description && typeof suggestion.description === 'string' &&
      ['low', 'medium', 'high'].includes(suggestion.priority)
    );

    // Öncelik sırasına göre sırala ve sınırlı sayı dön
    try {
      return suggestions
        .sort((a: SmartSuggestion, b: SmartSuggestion) => {
          const priorities = { high: 3, medium: 2, low: 1 };
          return priorities[b.priority] - priorities[a.priority];
        })
        .slice(0, 5); // İlk 5 öneri
    } catch (error) {
      // Sıralama hatası durumunda güvenli varsayılan
      console.error('Smart suggestions sorting error:', error);
      return suggestions.slice(0, 5);
    }
  }
}

export const smartSuggestionsService = SmartSuggestionsService.getInstance();
