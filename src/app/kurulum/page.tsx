'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tokenManager } from '../../lib/auth/tokenManager';

export default function SetupGuidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [setupStep, setSetupStep] = useState<'login' | 'permission' | 'sheets'>('login');

  // User logged in, show permission step
  useEffect(() => {
    if (session) {
      setSetupStep('permission');

      // If already has user sheets in localStorage, redirect to profil
      const existingSheets = localStorage.getItem('userSheetsId');
      if (existingSheets) {
        setSetupStep('sheets');
        // Check if sheets are fully set up by trying to load them
        setTimeout(() => router.push('/profil'), 2000);
      }
    }
  }, [session, router]);

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/kurulum' });
  };

  const handleContinueToApp = async () => {
    try {
      // Google Sheets oluşturma işlemi
      await createUserSheets();
      router.push('/profil');
    } catch (error) {
      console.error('Sheets oluşturma hatası:', error);
      alert('Sheets oluşturma sırasında hata oluştu. Tekrar deneyin.');
    }
  };

  // Kullanıcı için personal Google Sheets oluştur
  const createUserSheets = async () => {
    try {
      const accessToken = await tokenManager.getValidToken();

      if (!session?.user?.email) {
        throw new Error('Kullanıcı email bilgisi eksik');
      }

      // Yeni Spreadsheet oluştur
      const createResponse = await fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              title: `İlaç Takip Sistemi - ${session.user.email}`,
              locale: 'tr_TR',
            },
            sheets: [
              {
                properties: {
                  title: 'ilaclar',
                  sheetType: 'GRID',
                  gridProperties: { rowCount: 1000, columnCount: 10 }
                }
              },
              {
                properties: {
                  title: 'ilac_gecmis',
                  sheetType: 'GRID',
                  gridProperties: { rowCount: 5000, columnCount: 8 }
                }
              },
              {
                properties: {
                  title: 'kan_sekeri',
                  sheetType: 'GRID',
                  gridProperties: { rowCount: 2000, columnCount: 6 }
                }
              },
              {
                properties: {
                  title: 'tansiyon',
                  sheetType: 'GRID',
                  gridProperties: { rowCount: 2000, columnCount: 7 }
                }
              }
            ]
          })
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('Google Sheets API Error:', errorData);
        throw new Error('Sheets oluşturma başarısız');
      }

      const sheetData = await createResponse.json();
      const spreadsheetId = sheetData.spreadsheetId;

      // Başlık satırlarını ekle
      await addSheetHeaders(accessToken, spreadsheetId);

      // Sheets ID'yi kaydet
      localStorage.setItem('userSheetsId', spreadsheetId);
      localStorage.setItem('sheetsCreatedAt', new Date().toISOString());

      console.log('✅ User sheets oluşturuldu:', spreadsheetId);

    } catch (error) {
      console.error('Sheets creation failed:', error);
      throw error;
    }
  };

  // Sheets'lere başlık satırları ekle
  const addSheetHeaders = async (accessToken: string, spreadsheetId: string) => {
    const headersData = {
      ilaclar: [
        'İlaç ID', 'İlaç Adı', 'Doz', 'Birim', 'Zaman', 'Aktif', 'Stok',
        'Fotoğraf URL', 'Oluşturulma', 'Güncelleme'
      ],
      ilac_gecmis: [
        'Kayıt ID', 'İlaç ID', 'Tarih', 'Saat', 'Durum', 'Erteleme Dakika',
        'Not', 'Sync', 'Timestamp'
      ],
      kan_sekeri: [
        'Kayıt ID', 'Tarih', 'Saat', 'Değer', 'Tür', 'Normal', 'Not', 'Sync', 'Timestamp'
      ],
      tansiyon: [
        'Kayıt ID', 'Tarih', 'Saat', 'Sistolik', 'Diyastolik', 'Nabız',
        'Normal', 'Not', 'Sync', 'Timestamp'
      ]
    };

    // Her sheet için headers ekle
    for (const [sheetName, headers] of Object.entries(headersData)) {
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:J1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [headers]
          })
        }
      );

      if (!updateResponse.ok) {
        console.warn(`Header ekleme başarısız (${sheetName}):`, await updateResponse.text());
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔐 Güvenli Kurulumu
          </h1>
          <p className="text-xl text-gray-600">
            Tüm verileriniz kendi Google hesabınızda güvenli bir şekilde saklanır
          </p>
        </header>

        {/* Login Step */}
        {setupStep === 'login' && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-8 rounded-xl shadow-xl mb-8">
              <div className="text-6xl mb-4">🔑</div>
              <h2 className="text-3xl font-bold mb-4">Sisteme Giriş</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Güvenli ve KVKK uyumlu ilaç takip sistemi için Google hesabınıza giriş yapın
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-dashed border-green-300 max-w-lg mx-auto mb-8">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Tek Tık Kurulumu</h3>
              <p className="text-gray-600 mb-6">
                Google hesabunuz ile giriş yaparak sistem otomatik olarak kurulur. Hiç teknik bilgi gerekmez!
              </p>
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                🔐 Google ile Güvenli Giriş Yap
              </button>
            </div>

            <div className="text-left">
              <h3 className="text-xl font-semibold mb-4">👤 Sistemi Kullandıran Kişiler:</h3>
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-4xl mb-2">👴</div>
                  <h4 className="font-bold text-gray-800">Yaşlı Hastalar</h4>
                  <p className="text-gray-600">İlaçlarını hatırlama ve takip sistemi</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-4xl mb-2">💼</div>
                  <h4 className="font-bold text-gray-800">Bakıcılar</h4>
                  <p className="text-gray-600">Birden fazla kişi için güvenli monitoring</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-4xl mb-2">🏥</div>
                  <h4 className="font-bold text-gray-800">Bakımevi Personeli</h4>
                  <p className="text-gray-600">Profesyonel ilaç yönetimi</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permission Step - User is logged in */}
        {setupStep === 'permission' && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-xl shadow-xl mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold mb-4">Hoş Geldiniz!</h2>
              <p className="text-xl opacity-90">
                Sisteme başarıyla giriş yaptınız: <strong>{session?.user?.email}</strong>
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-dashed border-blue-300 max-w-3xl mx-auto mb-8">
              <div className="text-5xl mb-4">🔓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Son Adım: Güvenlik İzni</h3>

              <div className="text-left mb-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Güvenli Veri Saklama</h4>
                    <p className="text-gray-600">Kendi Google Drive ve Sheets hesabınızda veriler saklanacak</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Hafıza</h4>
                    <p className="text-gray-600">İlaç hatırlatmaları için kendinize Calendar izin verenizi onaylayın</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">KVKK Uyumluluk</h4>
                    <p className="text-gray-600">%100 kullanıcı kontrolü altında veri saklama</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-bold text-gray-800 mb-2">Google'dan Gelecek Güvenlik Uyarısı:</h4>
                <p className="text-gray-700 text-sm">
                  "Bu app şunlara erişmek istiyor:"<br/>
                  → Google profil bilgileriniz (okuma)<br/>
                  → Google Sheets dokümanlarınız (tam erişim)<br/>
                  → Google Calendar etkinlikleriniz (tam erişim)<br/>
                  → Google Drive dosyalarınız (dosya yükleme)
                </p>
              </div>

              <button
                onClick={handleContinueToApp}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Sistemi Aktif Et
              </button>

              <p className="text-sm text-gray-500 mt-4">
                Sistem otomatik olarak size özel güvenli veri alanı oluşturacaktır
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">📊 Sistem Özellikleri:</h4>
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-3xl mb-2">🛡️</div>
                  <h5 className="font-bold text-green-800">KVKK Uyumsuz</h5>
                  <p className="text-green-700 text-sm">Verileriniz hiçbir zaman servisa gönderilmez</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-3xl mb-2">📱</div>
                  <h5 className="font-bold text-blue-800">Offline-First</h5>
                  <p className="text-blue-700 text-sm">İnternet olmadan çalışabilir</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-3xl mb-2">👥</div>
                  <h5 className="font-bold text-purple-800">Aile Dostu</h5>
                  <p className="text-purple-700 text-sm">Fotoğraf paylaşımı ile işbirliği</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sheets Setup Complete */}
        {setupStep === 'sheets' && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8 rounded-xl shadow-xl mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4">Kurulum Tamamlandı!</h2>
              <p className="text-xl opacity-90">
                Kişisel veri alanınız başarıyla oluşturulmuştur
              </p>
            </div>

            <p className="text-lg text-gray-600 mb-6">
              Artık sisteminizi kullanabilirsiniz!
            </p>

            <button
              onClick={handleContinueToApp}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Sisteme Geç
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
