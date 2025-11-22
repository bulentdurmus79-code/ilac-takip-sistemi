'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IlacForm } from '@/components/ilac/IlacForm';

export default function EkleIlacPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/giris');
    }
  }, [session, status, router]);

  const handleSubmit = async (data: {
    ilac_adi: string;
    doz: string;
    birim: string;
    zamanlar: string;
    stok: number;
    foto_url?: string;
  }) => {
    try {
      const response = await fetch('/api/ilac/ekle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('İlaç eklenirken hata oluştu');
      }

      const result = await response.json();
      setSuccessMessage(`${result.medicine.ilac_adi} başarıyla eklendi!`);
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/ilaclar');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      alert('İlaç eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleCancel = () => {
    router.push('/ilaclar');
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Başarılı!</h2>
          <p className="text-2xl text-gray-700 mb-4">{successMessage}</p>
          <p className="text-lg text-gray-600">
            İlaç listesine yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <IlacForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
