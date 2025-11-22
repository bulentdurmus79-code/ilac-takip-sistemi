'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { notificationService } from '@/lib/utils/notifications';
import { smartSuggestionsService, SmartSuggestion } from '@/lib/utils/smartSuggestions';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/giris');
      return;
    }

    // Check if user has completed profile setup
    const checkProfile = async () => {
      try {
        const response = await fetch('/api/profil');
        const data = await response.json();
        if (!data.profile) {
          router.push('/profil');
        }
      } catch (error) {
        console.error('Profile check failed:', error);
      }
    };

    const loadSmartSuggestions = async () => {
      try {
        // Get user data
        const [medicinesRes, recordsRes, profileRes] = await Promise.all([
          fetch('/api/ilac/liste'),
          fetch('/api/ilac/kayitlar'), // We'll create this endpoint later
          fetch('/api/profil')
        ]);

        const medicines = medicinesRes.ok ? (await medicinesRes.json()).medicines : [];
        const medicineRecords = recordsRes.ok ? (await recordsRes.json()).records : [];
        const userProfile = profileRes.ok ? (await profileRes.json()).profile : {};

        // Generate smart suggestions
        const allSuggestions = smartSuggestionsService.getAllSuggestions(
          medicines,
          medicineRecords,
          [], // Health records - will be added later
          userProfile
        );
        setSuggestions(allSuggestions);

        // Check for critical reminders and announce
        const criticalSuggestions = allSuggestions.filter(s => s.priority === 'high');
        if (criticalSuggestions.length > 0) {
          const firstCritical = criticalSuggestions[0];
          // Voice notification
          await notificationService.announceMedicine('Önemli Hatırlatma', firstCritical.title, 'şimdi');

          // Browser notification
          await notificationService.notify(
            firstCritical.title,
            firstCritical.description,
            '/icon-alert.png'
          );
        }
      } catch (error) {
        console.error('Smart suggestions load failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
    loadSmartSuggestions();

    // Check every 30 minutes for new suggestions
    const interval = setInterval(loadSmartSuggestions, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session, status, router]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-500';
      case 'medium': return 'bg-yellow-100 border-yellow-500';
      case 'low': return 'bg-green-100 border-green-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

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
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🏥 Akıllı İlaç Takip Sistemi
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Sesli hatırlatmalar ve akıllı öneriler ile
              </p>
              <p className="text-lg text-indigo-600 font-medium">
                Hoş geldiniz, {session.user?.name || 'Kullanıcı'}!
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => notificationService.morningGreeting(session.user?.name || 'Arkadaşım')}
                variant="success"
                size="sm"
              >
                🔊 Sesli Selamlama
              </Button>
            </div>
          </div>
        </header>

        {/* Akıllı Öneriler Bölümü */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              💡 Akıllı Öneriler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(suggestion.priority)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{suggestion.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded capitalize ${
                      suggestion.priority === 'high' ? 'bg-red-200 text-red-800' :
                      suggestion.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{suggestion.description}</p>
                  {suggestion.action && (
                    <Link href={suggestion.action.href}>
                      <Button variant="primary" size="sm">
                        {suggestion.action.label}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ana Özellikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/ilaclar">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                💊 İlaçlarım
              </h2>
              <p className="text-gray-600 mb-4">İlaçlarınızı yönetin ve takip edin</p>
              <span className="text-blue-600 font-medium">→ Yönet</span>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              ⏰ Hatırlatmalar
            </h2>
            <p className="text-gray-600 mb-4">Google Calendar entegrasyonu ile</p>
            <p className="text-sm text-gray-500">Otomatik hatırlatmalar aktif</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              📊 Sağlık Takibi
            </h2>
            <p className="text-gray-600 mb-4">Kan şekeri, tansiyon ölçümleriniz</p>
            <p className="text-sm text-gray-500">Yakında gelecek</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              🎯 Kişisel Profil
            </h2>
            <p className="text-gray-600 mb-4">Sağlık geçmişiniz ve tercihleriniz</p>
            <Link href="/profil" className="text-blue-600 font-medium text-sm">
              → Güncelle
            </Link>
          </div>
        </div>

        {/* Sistem Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-900 flex items-center gap-2">
              ✅ Sistem Özellikleri
            </h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• %100 ücretsiz (tarayıcı API'leri)</li>
              <li>• KVKK-uyumlu (veri kaybı风险i yok)</li>
              <li>• Offline-first çalışabilme</li>
              <li>• Sesli hatırlatmalar</li>
              <li>• Akıllı öneri sistemi</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 flex items-center gap-2">
              📞 Destek & Kurulum
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              İlk kurulumda yardım mı lazım? Aile üyeleriniz bu adımları takip edebilir.
            </p>
            <Link href="/kurulum">
              <Button variant="secondary" size="sm">
                Kurulum Rehberi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
