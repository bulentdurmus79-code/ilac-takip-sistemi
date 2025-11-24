// PAGINATION & SEARCH SYSTEM - Performans ve arama optimizasyonu

interface Medicine {
  ilac_id: string;
  ilac_adi: string;
  doz: number;
  birim: string;
  zaman?: string;
  foto_url?: string;
  stok?: number;
  kullanici_email: string;
}

interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: 'ilac_adi' | 'zaman' | 'stok' | 'kullanici_email';
  sortOrder?: 'asc' | 'desc';
}

interface SearchOptions {
  query?: string;
  filterBy?: {
    birim?: string;
    stokDusukMu?: boolean;
    zamanAraligi?: { start: string; end: string };
  };
}

interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Fuzzy search benzeri basit string arama (Fuse.js benzeri)
export class FuzzySearch {
  private turkishNormalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      // Temel harf harici karakterleri kaldır
      .replace(/[^a-z0-9 ]/g, ' ')
      .trim();
  }

  // String benzerlik skoru (0-1 arası)
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = this.turkishNormalize(str1);
    const s2 = this.turkishNormalize(str2);

    if (s1 === s2) return 1;

    // Substring arama
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Kelime bazlı arama
    const words1 = s1.split(' ');
    const words2 = s2.split(' ');

    let matchCount = 0;
    for (const word2 of words2) {
      if (words1.some(word1 => word1.includes(word2) || word2.includes(word1))) {
        matchCount++;
      }
    }

    return Math.min(matchCount / words2.length, 0.7);
  }

  // Multi-field search
  search<T extends Record<string, any>>(
    items: T[],
    query: string,
    searchFields: (keyof T)[],
    threshold: number = 0.3
  ): T[] {
    if (!query.trim()) return items;

    const results = items.map(item => {
      let maxSimilarity = 0;

      for (const field of searchFields) {
        const fieldValue = String(item[field] || '');
        const similarity = this.calculateSimilarity(fieldValue, query);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }

      return { item, score: maxSimilarity };
    });

    return results
      .filter(result => result.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item);
  }
}

// Ana pagination ve arama sınıfı
export class PaginatedMedicineSearch {
  private fuzzySearch = new FuzzySearch();

  // medicines search alanları
  private searchFields: (keyof Medicine)[] = ['ilac_adi', 'birim'];

  // Ana arama fonksiyonu
  async searchAndPaginate(
    allMedicines: Medicine[],
    searchOptions: SearchOptions = {},
    paginationOptions: PaginationOptions = { page: 1, pageSize: 10 }
  ): Promise<PaginatedResult<Medicine>> {

    // 1. Arama uygula
    let filteredItems = allMedicines;

    if (searchOptions.query?.trim()) {
      filteredItems = this.fuzzySearch.search(
        allMedicines,
        searchOptions.query,
        this.searchFields,
        0.4 // %40 eşik değeri
      );
    }

    // 2. Filtreleme uygula
    if (searchOptions.filterBy) {
      filteredItems = this.applyFilters(filteredItems, searchOptions.filterBy);
    }

    // 3. Sıralama uygula
    filteredItems = this.applySorting(filteredItems, paginationOptions);

    // 4. Pagination uygula
    const paginatedResult = this.applyPagination(filteredItems, paginationOptions);

    return paginatedResult;
  }

  // Filtreleme mantığı
  private applyFilters(medicines: Medicine[], filters: NonNullable<SearchOptions['filterBy']>): Medicine[] {
    let filtered = medicines;

    // Birim filtresi
    if (filters.birim) {
      filtered = filtered.filter(med => med.birim === filters.birim);
    }

    // Stok düşük filtresi
    if (filters.stokDusukMu) {
      filtered = filtered.filter(med => (med.stok || 0) <= 10);
    }

    // Zaman aralığı filtresi
    if (filters.zamanAraligi) {
      const start = filters.zamanAraligi.start;
      const end = filters.zamanAraligi.end;

      filtered = filtered.filter(med => {
        if (!med.zaman) return false;

        const medicineTime = med.zaman;
        return medicineTime >= start && medicineTime <= end;
      });
    }

    return filtered;
  }

  // Sıralama mantığı
  private applySorting(medicines: Medicine[], options: PaginationOptions): Medicine[] {
    const { sortBy = 'ilac_adi', sortOrder = 'asc' } = options;

    return [...medicines].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Undefined değerleri handle et
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortOrder === 'asc' ? -1 : 1;

      // String karşılaştırma
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Sayısal karşılaştırma
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String karşılaştırma
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;

      return 0;
    });
  }

  // Pagination mantığı
  private applyPagination(medicines: Medicine[], options: PaginationOptions): PaginatedResult<Medicine> {
    const { page = 1, pageSize = 10 } = options;
    const totalItems = medicines.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedItems = medicines.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  // Gelişmiş arama önerileri
  getSearchSuggestions(query: string, medicines: Medicine[]): string[] {
    if (!query.trim()) return [];

    const suggestions = new Set<string>();

    // İlac isimlerinden öneriler
    medicines.forEach(medicine => {
      const name = medicine.ilac_adi.toLowerCase();
      const queryLower = query.toLowerCase();

      if (name.includes(queryLower)) {
        // Tam eşleşme önerisi
        suggestions.add(medicine.ilac_adi);

        // Kelime bazlı öneriler
        const words = name.split(' ');
        words.forEach(word => {
          if (word.startsWith(queryLower)) {
            suggestions.add(word);
          }
        });
      }
    });

    // Çok fazla öneri varsa limitle
    const suggestionArray = Array.from(suggestions);
    return suggestionArray.slice(0, 8); // Max 8 öneri
  }

  // Arama istatistikleri
  getSearchStats(
    originalCount: number,
    filteredCount: number,
    searchQuery?: string,
    filtersApplied?: string[]
  ) {
    return {
      originalCount,
      filteredCount,
      resultsFound: filteredCount,
      searchQuery: searchQuery || null,
      filtersApplied: filtersApplied || [],
      performance: {
        searchTime: Date.now(), // Basit zaman tracking
        fuzzyMatchingEnabled: true,
        paginationEnabled: true
      }
    };
  }

  // Performans monitorinte
  getPerformanceMetrics() {
    return {
      searchEnabled: true,
      fuzzyEnabled: true,
      filtersEnabled: true,
      paginationEnabled: true,
      sortingEnabled: true,
      // Daha sonra real performans metrikleri eklenebilir
    };
  }
}

// Global instance
export const medicineSearch = new PaginatedMedicineSearch();
