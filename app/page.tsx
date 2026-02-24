'use client';

import Link from 'next/link';
import CentralV2 from '@/components/central-v2';
import { useState } from 'react';

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Admin Access Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>⚙️</span> Admin
        </button>
      </div>

      {/* Admin Portal Link */}
      {showAdmin && (
        <div className="absolute top-16 right-4 z-50 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg">
          <div className="space-y-3">
            <div>
              <p className="text-slate-400 text-sm mb-2">Acceso al Panel de Administración</p>
              <Link
                href="/admin"
                className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-center transition-colors"
              >
                Dashboard Admin
              </Link>
            </div>
            <div className="text-xs text-slate-400">
              <p>Usuarios de prueba:</p>
              <p>• admin@central.local (Super Admin)</p>
              <p>• admin@example.com (Admin)</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Component */}
      <CentralV2 />
    </div>
  );
}
