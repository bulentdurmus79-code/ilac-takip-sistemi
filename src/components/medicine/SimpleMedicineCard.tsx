'use client';

import { useState } from 'react';

interface Medicine {
  ilac_id: string;
  ilac_adi: string;
  doz: number;
  birim: string;
  zaman?: string;
  foto_url?: string;
  stok?: number;
}

interface SimpleMedicineCardProps {
  medicine: Medicine;
  onTakeMedicine: (medicineId: string) => void;
}

export function SimpleMedicineCard({ medicine, onTakeMedicine }: SimpleMedicineCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleTake = () => {
    if (confirm(`💊 ${medicine.ilac_adi}\n\n${medicine.doz} ${medicine.birim} almak istiyor musunuz?`)) {
      onTakeMedicine(medicine.ilac_id);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 mx-4 border-4 border-gray-100">
      {/* Ana Kart Alanı - Tam ekran genişliğinde */}
      <div className="flex flex-col items-center gap-6">

        {/* İlaç Resmi - Büyük boyutta */}
        <div className="relative">
          {medicine.foto_url ? (
            <img
              src={medicine.foto_url}
              alt={medicine.ilac_adi}
              className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-white"
            />
          ) : (
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-6xl">💊</span>
            </div>
          )}
        </div>

        {/* İlaç Adı - Büyük yazı */}
        <h2 className="text-5xl font-bold text-center text-gray-800 leading-tight px-4">
          {medicine.ilac_adi}
        </h2>

        {/* Ana ALDIM Butonu - EN BÜYÜK */}
        <button
          onClick={handleTake}
          className="w-full h-32 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                   text-white text-4xl font-bold rounded-2xl
                   active:scale-95 transition-all duration-150 transform
                   shadow-xl border-4 border-green-300
                   hover:shadow-2xl"
        >
          💊 ALDIM
        </button>

        {/* Detay Göster/Gizle Butonu */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-3xl text-blue-600 hover:text-blue-800 underline font-medium
                   transition-colors duration-200"
        >
          {showDetails ? '▲ Detayları Gizle' : '▼ Detayları Göster'}
        </button>

        {/* Detay Bilgileri - Sadece açık olduğunda göster */}
        {showDetails && (
          <div className="bg-gray-50 rounded-xl p-6 w-full border-2 border-gray-200">

            {/* Zaman Bilgisi */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="text-center">
                <div className="text-7xl mb-2">⏰</div>
                <div className="text-2xl font-bold text-gray-800">
                  {medicine.zaman || 'Zaman belirtilmemiş'}
                </div>
                <div className="text-lg text-gray-600">Saat</div>
              </div>

              <div className="w-px h-16 bg-gray-300"></div>

              <div className="text-center">
                <div className="text-7xl mb-2">📏</div>
                <div className="text-3xl font-bold text-gray-800">
                  {medicine.doz} {medicine.birim}
                </div>
                <div className="text-lg text-gray-600">Doz</div>
              </div>

              {medicine.stok !== undefined && (
                <>
                  <div className="w-px h-16 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-7xl mb-2">
                      {medicine.stok > 5 ? '📦' : medicine.stok <= 0 ? '❌' : '⚠️'}
                    </div>
                    <div className={`text-3xl font-bold ${medicine.stok <= 5 ? 'text-red-600' : medicine.stok <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {medicine.stok}
                    </div>
                    <div className="text-lg text-gray-600">Kalan</div>
                  </div>
                </>
              )}
            </div>

            {/* Stok Uyarısı */}
            {medicine.stok !== undefined && medicine.stok <= 5 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">⚠️</div>
                  <div>
                    <p className="text-xl font-bold text-red-800">Stok Azalıyor!</p>
                    <p className="text-lg text-red-700">Sadece {medicine.stok} adet kaldı. Yeni paket almayı unutmayın.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hızlı Aksiyon Butonları */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleTake}
                className="flex-1 h-20 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-xl
                         transition-colors duration-200 shadow-lg"
              >
                ✓ ALDIM
              </button>

              <button
                onClick={() => window.open('tel:+90XXXXXXXXXX')}
                className="flex-1 h-20 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-xl
                         transition-colors duration-200 shadow-lg"
              >
                📞 Eczane Ara
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alt Kenar Çizgisi - İşlem Tamamlandığını Gösterir */}
      <div className="mt-6 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl p-1">
        <div className={`h-3 rounded-xl transition-all duration-1000 ${
          Date.now() % 10000 < 5000 ? 'bg-green-400' : 'bg-blue-400'
        }`}></div>
      </div>
    </div>
  );
}
