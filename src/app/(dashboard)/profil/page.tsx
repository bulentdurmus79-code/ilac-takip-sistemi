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

        {/* Google Sheets Kurulumu Bölümü */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Google Sheets Kurulumu Gereklidir
            </h2>
            <p className="text-blue-700 mb-4">
              İlaç takip verileriniz için kişisel Google Sheets şablonu oluşturmanız zorunludur
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Super Basit Kurulum!</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 text-sm">
              <li>Aşağıdaki butona tıklayarak hazır şablonu kendi Google Drive'ınızda kopyalayın</li>
              <li>"İlaç Takip [İsminiz]" gibi bir isimle kaydedin (Google Console veya API ayarlarına gerek yok!)</li>
              <li>Bu kadar! Artık profil bilgilerinizi saklamak için hazır</li>
            </ol>
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
              <strong>✨ Kolaylık:</strong> Karmaşık API ayarları yapmanıza gerek yok! Sadece kopyala ve kullanmaya başla.
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm border max-w-md w-full">
              <p className="text-sm text-gray-600 mb-4">
                ✨ Kişisel verilerinizin bulunduğu Google Sheet'inizi oluşturun
              </p>
              <button
                onClick={() => {
                  const templateUrl = 'https://docs.google.com/spreadsheets/d/1EzHGDwKgt--A86w_k90ISrDKlagdeuyU0ryaEmoVOiY/copy';
                  window.open(templateUrl, '_blank');

                  // Kullanıcıya bilgi ver
                  setTimeout(() => {
                    alert('🎉 Google Sheets şablonu yeni sekmede açıldı!\n\n📝 Yeni sekmede:\n1. "Şablondan kopyala"yı seçin\n2. İsim verin: "İlaç Takip [İsminiz]"\n3. Drive\'ınızda kaydedin\n4. URL\'den ID\'yi alın\n5. Bu sayfaya dönerek profil doldurun');
                  }, 1000);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                🔗 Google Sheets Şablonu Oluştur
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Tıklayınca yeni sekmede açılır • Kendi Google hesabınızda güvenli şekilde saklanır
              </p>
            </div>
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
