import { Suspense } from 'react';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}
