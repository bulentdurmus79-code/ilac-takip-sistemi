'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IlacSheetData } from '@/types/sheets';

export default function AlSayfasiClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [medicine, setMedicine] = useState<IlacSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const medicineId = searchParams.get('id');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/giris');
      return;
    }

    if (!medicineId) {
      router.push('/');
      return;
    }

    // Load medicine details (in a real app, load from IndexedDB or API)
    // For now, simulate loading
    const loadMedicine = async () => {
      try {
        // This would be replaced with IndexedDB lookup or API call
        // For simulation, create a mock medicine
        const mockMedicine: IlacSheetData = {
          ilac_id: medicineId,
          ilac_adi: 'Parol',
          doz: '500',
          birim: 'mg',
          zamanlar: '09:00,15:00,21:00',
          stok: 28,
          foto_url: '',
          kullanici_email: session.user?.email || '',
          aktif: true,
          olusturma_tarih: new Date().toISOString().split('T')[0],
        };
        setMedicine(mockMedicine);
      } catch (error) {
        console.error('İlaç yüklenirken hata:', error);
      }
    };

    loadMedicine();
  }, [session, status, router, medicineId]);

  const handleMedicineTaken = async () => {
    if (!medicine) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ilac/aldim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ilac_id: medicine.ilac_id,
        }),
      });

      if (!response.ok) {
        throw new Error('İlaç alındı kaydedilirken hata oluştu');
      }

      setSuccess(true);
    } catch (error) {
      console.error('Error:', error);
      alert('İlaç alındı kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSnooze = async () => {
    if (!medicine) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ilac/aldim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ilac_id: medicine.ilac_id,
          erteleme_dk: 15, // Snooze for 15 minutes
        }),
      });

      if (!response.ok) {
        throw new Error('İlaç ertelemesi kaydedilirken hata oluştu');
      }

      alert('Hatırlatma 15 dakika ertelendi');
      router.push('/');
    } catch (error) {
      console.error('Error:', error);
      alert('İlaç ertelemesi kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  if (status === 'loading' || !medicine) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-8xl mb-4">✅</div>
          <h2 className="text-4xl font-bold text-green-600 mb-4">Alındı!</h2>
          <p className="text-3xl text-gray-700 mb-4">
            {medicine.ilac_adi} alındı olarak kaydedildi
          </p>
          <Button variant="success" size="xl" onClick={handleClose}>
            Tamam
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">💊</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {medicine.ilac_adi}
          </h1>
          <p className="text-2xl text-gray-700">
            {medicine.doz} {medicine.birim}
          </p>
          <p className="text-lg text-gray-600 mt-2">
            Stok: {medicine.stok} adet
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="success"
            size="xl"
            onClick={handleMedicineTaken}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Kaydediliyor...' : '✓ ALDIM'}
          </Button>

          <Button
            variant="warning"
            size="lg"
            onClick={handleSnooze}
            disabled={loading}
            className="w-full"
          >
            ⏰ 15 Dakika Ertele
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleClose}
            className="w-full"
          >
            Daha Sonra Hatırlat
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          Bu ekran hatırlatıcıdan otomatik açılmıştır
        </div>
      </div>
    </div>
  );
}
