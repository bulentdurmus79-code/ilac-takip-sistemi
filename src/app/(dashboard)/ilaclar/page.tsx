'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { IlacSheetData } from '@/types/sheets';

export default function IlaclarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [medicines, setMedicines] = useState<IlacSheetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/giris');
      return;
    }

    const loadMedicines = async () => {
      try {
        const response = await fetch('/api/ilac/liste');
        if (response.ok) {
          const data = await response.json();
          setMedicines(data.medicines);
        }
      } catch (error) {
        console.error('İlaçlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">İlaçlarım</h1>
            <p className="text-xl text-gray-600">İlaçlarımı yönet ve takip et</p>
          </div>
          <Link href="/ilaclar/ekle">
            <Button variant="success" size="lg">
              Yeni İlaç Ekle
            </Button>
          </Link>
        </header>

        {medicines.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💊</div>
            <h2 className="text-3xl font-bold text-gray-700 mb-4">
              Henüz ilaç eklenmemiş
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Birlikte başlayalım! İlk ilacınızı ekleyin.
            </p>
            <Link href="/ilaclar/ekle">
              <Button variant="primary" size="xl">
                İlk İlacımı Ekle
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <div key={medicine.ilac_id} className="bg-white rounded-lg shadow-lg p-6">
                {medicine.foto_url && (
                  <img
                    src={medicine.foto_url}
                    alt={medicine.ilac_adi}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {medicine.ilac_adi}
                </h3>
                <p className="text-lg text-gray-700 mb-2">
                  {medicine.doz} {medicine.birim}
                </p>
                <p className="text-gray-600 mb-4">
                  {medicine.zamanlar.replace(/,/g, ', ')}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    medicine.stok > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Stok: {medicine.stok}
                  </span>
                  <Button variant="primary" size="sm">
                    Detaylar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="secondary" size="lg">
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
