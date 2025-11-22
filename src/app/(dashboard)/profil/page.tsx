'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileForm } from '@/components/user/ProfileForm';
import { SheetSetupWizard } from '@/components/setup/SheetSetupWizard';
import { KullaniciSheetData } from '@/types/sheets';

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [existingProfile, setExistingProfile] = useState<KullaniciSheetData | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/giris');
      return;
    }

    const loadExistingProfile = async () => {
      try {
        const response = await fetch('/api/profil');
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setExistingProfile(data.profile);
          }
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
      }
    };

    loadExistingProfile();
  }, [session, status, router]);

  const handleProfileSubmit = async (profileData: {
    isim: string;
    soyisim: string;
    cinsiyet: string;
    yas: number;
    hastaliklar: string;
  }) => {
    setLoading(true);

    try {
      const response = await fetch('/api/profil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Profil kaydedilirken hata oluştu');
      }

      const result = await response.json();
      setSuccessMessage('Profil başarıyla kaydedildi!');
      setExistingProfile(result.profile);

    } catch (error) {
      console.error('Error:', error);
      alert('Profil kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-8xl mb-4">✅</div>
          <h2 className="text-4xl font-bold text-green-600 mb-4">Profil Kaydedildi!</h2>
          <p className="text-2xl text-gray-700 mb-4">{successMessage}</p>
          <p className="text-lg text-gray-600">
            Şimdi Google Sheets kurulumu yapabilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Profil'inizi Tamamlayın
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Kişisel bilgilerinizi güvenli şekilde Google Sheets'inizde saklayacağız
          </p>
          <p className="text-lg text-indigo-600 font-medium">
            {session.user?.email}
          </p>
        </header>

        {!existingProfile ? (
          <ProfileForm
            onSubmit={handleProfileSubmit}
            onCancel={() => router.push('/')}
            initialData={undefined}
          />
        ) : (
          <div className="space-y-6">
            {/* Profil bilgileri mevcut - şimdi sheet kurulumunu göster */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">✅ Profil Tamamlandı!</h3>
                  <p className="text-green-700">
                    Hoş geldiniz, {existingProfile.isim} {existingProfile.soyisim}!
                  </p>
                </div>
                <button
                  onClick={() => setExistingProfile(null)}
                  className="text-green-600 hover:text-green-800 underline text-sm"
                >
                  Düzenle
                </button>
              </div>
            </div>

            {/* Sheet kurulum wizard'ı */}
            <SheetSetupWizard />
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
