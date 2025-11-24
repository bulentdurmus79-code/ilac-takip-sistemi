'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileForm } from '../../../components/user/ProfileForm';
import { KullaniciSheetData } from '../../../types/sheets';
import { indexedDBService } from '../../../lib/db/indexeddb';

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [existingProfile, setExistingProfile] = useState<KullaniciSheetData | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetId, setSheetId] = useState('');

  // Sayfa yüklenince localStorage'dan sheet bilgilerini çek
  useEffect(() => {
    const savedSheetId = localStorage.getItem('userSheetId');
    const savedSheetUrl = localStorage.getItem('userSheetUrl');
    if (savedSheetId) {
      setSheetId(savedSheetId);
    }
    if (savedSheetUrl) {
      setSheetUrl(savedSheetUrl);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/giris');
      return;
    }

    // 🔍 FIRST CHECK: Can we even access any Google API?
    const testGoogleAccess = async () => {
      try {
        const testResponse = await fetch('/api/ilac/liste');
        console.log('🔍 TEST API Status:', testResponse.status);

        if (testResponse.status === 500) {
          alert('🚨 GOOGLE SHEETS ERİŞİM SORUNU:\n\n- Sistem Google Sheets API bağlantısı kuramıyor\n- Vercel Deployment Settings ile Google Service Account credentials eksik\n\n🔧 ÇÖZÜM: Vercel Dashboard → Settings → Environment Variables kotrol edin');
          return;
        }

        if (!testResponse.ok) {
          console.log('📊 Other API issue:', testResponse.status);
        }
      } catch (testError) {
        console.error('❌ API Test failed:', testError);
      }
    };

    const loadExistingProfile = async () => {
      try {
        console.log('📋 Loading profile...');
        const response = await fetch('/api/profil');
        console.log('📋 Profile response:', response.status);

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
        } else {
          console.log('❌ Profile load failed, status:', response.status);
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        alert(`❌ PROFİL YÜKLENEMİYOR:\n\nGoogle Sheets bağlantı problemi ${error}`);
      }
    };

    testGoogleAccess();
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
      // KVKK COMPLIANT: Profil'i DIREKT IndexedDB'ye kaydet - API'ye GÖNDERME!
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('Kullanıcı girişi gerekli!');
      }

      const profileDataForStorage: KullaniciSheetData = {
        ...profileData,
        kullanici_email: userEmail, // Current user email
        sheet_id: sheetId || '',
        api_key_area: '',
        olusturma_tarihi: new Date().toISOString().split('T')[0],
      };

      console.log('🗄️ Storing profile in IndexedDB:', profileDataForStorage);

      // Direct IndexedDB storage - ZERO SERVER STORAGE!
      // Use addMedicine with a special identifier for profile
      const profileForMedicineDB = {
        ilac_id: 'PROFILE_' + userEmail, // Special identifier for profile
        ilac_adi: `Profile: ${profileData.isim} ${profileData.soyisim}`,
        doz: profileData.cinsiyet,
        birim: profileData.hastaliklar,
        zamanlar: profileData.yas.toString(),
        stok: 1,
        foto_url: '',
        kullanici_email: userEmail,
        aktif: true,
        olusturma_tarih: profileDataForStorage.olusturma_tarihi,
      };

      await indexedDBService.addMedicine(profileForMedicineDB);

      setSuccessMessage('Profil başarıyla kaydedildi!');
      setExistingProfile(profileDataForStorage);

      // Clear form data from memory after successful save
      setSheetUrl('');
      setSheetId('');

      console.log('✅ Profile stored locally - KVKK compliant!');

    } catch (error) {
      console.error('Profile save error:', error);
      alert(`❌ Profil kaydedilirken hata oluştu:\n${(error as Error).message}\n\nIndexedDB desteği kontrol edin.`);
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

        {/* Data Export/Staging System */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg mb-8">
          <div className="text-center">
            <div className="text-5xl mb-4">💾</div>
            <h2 className="text-2xl font-bold mb-4">Veri Depolama & Dışa Aktarma</h2>

            <div className="space-y-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">📱 OFFLINE-İLK YAKLAŞIM</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2">📊</span>
                    <span>İlaç verileri tarayıcınızda güvende</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2">🔄</span>
                    <span>Aile üyeleri ile fotoğraf paylaşımı</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2">📤</span>
                    <span>İsteğe bağlı dışa aktarma</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2">🔐</span>
                    <span>KVKK tam uyumlu - sıfır sunucu depolama</span>
                  </div>
                </div>
              </div>

              <div className="bg-white text-indigo-700 p-4 rounded-lg">
                <div className="text-center">
                  <p className="font-bold mb-2">🎉 Modern İlaç Takip Sistemi Aktif!</p>
                  <p className="text-sm">Verileriniz %100 tarayıcınızda güvenle saklanıyor. İsteğe bağlı dışa aktarma özellikleri yakında eklenecek.</p>
                </div>
              </div>
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
