'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function GirisPage() {
  const handleGoogleSignIn = () => {
    signIn('google');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            İlaç Takip Sistemi
          </h1>
          <p className="text-gray-600 text-lg">
            Sağlıklı hayatınız için ilaçlarınızı takip edin
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Giriş Yapın
          </h2>

          <Button
            onClick={handleGoogleSignIn}
            className="w-full bg-blue-500 hover:bg-blue-600"
            variant="primary"
          >
            Google ile Giriş Yap
          </Button>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Google hesabınızla güvenli giriş yapın ve verilerinize erişin
          </p>
        </div>
      </div>
    </div>
  );
}
