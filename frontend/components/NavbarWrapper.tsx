'use client';

import { Suspense } from 'react';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  return (
    <Suspense fallback={
      <nav className="bg-white border-b-2 border-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-black text-gray-900">CampusQA</span>
            </div>
          </div>
        </div>
      </nav>
    }>
      <Navbar />
    </Suspense>
  );
}
