'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface IlacFormProps {
  onSubmit: (data: {
    ilac_adi: string;
    doz: string;
    birim: string;
    zamanlar: string;
    stok: number;
    foto_url?: string;
  }) => void;
  onCancel?: () => void;
}

export function IlacForm({ onSubmit, onCancel }: IlacFormProps) {
  const [formData, setFormData] = useState({
    ilac_adi: '',
    doz: '',
    birim: 'tb',
    zamanlar: '',
    stok: 0,
    foto_url: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        ilac_adi: '',
        doz: '',
        birim: 'tb',
        zamanlar: '',
        stok: 0,
        foto_url: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stok' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-center">Yeni İlaç Ekle</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            İlaç Adı *
          </label>
          <input
            type="text"
            name="ilac_adi"
            value={formData.ilac_adi}
            onChange={handleChange}
            className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            placeholder="Parol, Aspirin vb."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Doz *
            </label>
            <input
              type="text"
              name="doz"
              value={formData.doz}
              onChange={handleChange}
              className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="500mg, 2 tablet"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Birim
            </label>
            <select
              name="birim"
              value={formData.birim}
              onChange={handleChange}
              className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            >
              <option value="tb">Tablet</option>
              <option value="mg">Mg</option>
              <option value="ml">Ml</option>
              <option value="damla">Damla</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Alış Zamanları * (virgülle ayırın)
          </label>
          <input
            type="text"
            name="zamanlar"
            value={formData.zamanlar}
            onChange={handleChange}
            className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            placeholder="09:00,15:00,21:00"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Örnek: 09:00,15:00,21:00</p>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Stok Adedi
          </label>
          <input
            type="number"
            name="stok"
            value={formData.stok}
            onChange={handleChange}
            className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            placeholder="28"
            min="0"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Fotoğraf URL (opsiyonel)
          </label>
          <input
            type="url"
            name="foto_url"
            value={formData.foto_url}
            onChange={handleChange}
            className="w-full h-12 text-lg px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          variant="success"
          size="lg"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Kaydetiliyor...' : 'İlacı Ekle'}
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
