import { Suspense } from 'react';
import AlSayfasiClient from './AlSayfasiClient';

export default function AlSayfasi() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Yükleniyor...</div>
      </div>
    }>
      <AlSayfasiClient />
    </Suspense>
  );
}
