'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ProfileFormProps {
  onSubmit: (data: {
    isim: string;
    soyisim: string;
    cinsiyet: string;
    yas: number;
    hastaliklar: string;
  }) => void;
  onCancel?: () => void;
  initialData?: Partial<{
    isim: string;
    soyisim: string;
    cinsiyet: string;
    yas: number;
    hastaliklar: string;
  }>;
}

export function ProfileForm({ onSubmit, onCancel, initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    isim: initialData?.isim || '',
    soyisim: initialData?.soyisim || '',
    cinsiyet: initialData?.cinsiyet || 'kadın',
    yas: initialData?.yas || 65,
    hastaliklar: initialData?.hastaliklar || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yas' ? parseInt(value) || 65 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Kişisel Bilgileriniz
      </h3>

      <div className="text-center mb-6">
        <div className="text-6xl mb-4">👤</div>
        <p className="text-lg text-gray-600">
          Profil bilgilerinizi güvenli şekilde Google Sheets'inizde saklayacağız
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            İsim *
          </label>
          <input
            type="text"
            name="isim"
            value={formData.isim}
            onChange={handleChange}
            className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            placeholder="Adınız"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Soyisim *
          </label>
          <input
            type="text"
            name="soyisim"
            value={formData.soyisim}
            onChange={handleChange}
            className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            placeholder="Soyadınız"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Cinsiyet
          </label>
          <select
            name="cinsiyet"
            value={formData.cinsiyet}
            onChange={handleChange}
            className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
          >
            <option value="kadın">Kadın</option>
            <option value="erkek">Erkek</option>
            <option value="diğer">Diğer</option>
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Yaş
          </label>
          <input
            type="number"
            name="yas"
            value={formData.yas}
            onChange={handleChange}
            className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            placeholder="65"
            min="0"
            max="120"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Kronik Hastalıklarınız (Opsiyonel)
        </label>
        <textarea
          name="hastaliklar"
          value={formData.hastaliklar}
          onChange={handleChange}
          rows={3}
          className="w-full text-lg p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 resize-none"
          placeholder="Örneğin: Diyabet, Hipertansiyon, Kalp hastalığı..."
        />
        <p className="text-sm text-gray-500 mt-2">
          Bu bilgiler doktorunuz tarafından reçete edilen ilaçları takip etmek için kullanılır
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">🔒 Gizlilik Garantisi</h4>
        <p className="text-blue-800">
          Bilgileriniz tamamen Google hesabınızda saklanır. Vercel veya uygulama sahipleri tarafından erişilemez.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          variant="success"
          size="xl"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Kaydediliyor...' : 'Profili Kaydet'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
          >
            İptal
          </Button>
        )}
      </div>
    </form>
  );
}
