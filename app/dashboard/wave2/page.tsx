'use client'

import Wave2Enhanced from '../../../components/Wave2Enhanced';
import { useRouter } from 'next/navigation';

export default function Wave2Page() {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Back button overlay */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>
      <Wave2Enhanced />
    </div>
  );
}