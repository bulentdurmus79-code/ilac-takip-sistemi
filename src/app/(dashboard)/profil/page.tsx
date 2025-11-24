'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileForm } from '../../../components/user/ProfileForm';
import { KullaniciSheetData } from '../../../types/sheets';

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
            // 🚨KVKK CONTROL: Eğer profil var ama sheet_id yoksa kurulum zorunlu
            if (!data.profile.sheet_id) {
              router.push('/kurulum');
              return;
            }
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
            Artık sistem kurulumuna hazırsınız!
          </p>
          <button
            onClick={() => router.push('/kurulum')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-md font-semibold"
          >
            Google Sheets Kurulumu Yap
          </button>
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

        {/* Google Sheets Kurulumu - Çok Basit */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-8">
          <div className="text-center">
            <div className="text-5xl mb-3">📊</div>
            <h2 className="text-xl font-bold mb-2">İlaç Takip Verilerinizi Saklamak İçin</h2>
            <p className="text-blue-100 mb-4">Kendi Google Sheets şablonunuzu oluşturun - sadece 1 tık!</p>

            <button
              onClick={() => {
                const copyUrl = 'https://docs.google.com/spreadsheets/d/1EzHGDwKgt--A86w_k90ISrDKlagdeuyU0ryaEmoVOiY/copy';
                window.open(copyUrl, '_blank');
              }}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg shadow-xl transition-all hover:scale-105"
            >
              🚀 Şablonu Kopyala
            </button>

            <p className="text-blue-100 text-sm mt-3">
              💕 Verileriniz tamamen sizin Google hesabınızda güvenli şekilde saklanır
            </p>
          </div>
        </div>

        {!existingProfile ? (
          <ProfileForm
            onSubmit={handleProfileSubmit}
            onCancel={() => router.push('/')}
            initialData={undefined}
          />
        ) : (
          <div className="space-y-6">
            {/* Profil bilgileri mevcut - düzenleme seçeneği */}
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
