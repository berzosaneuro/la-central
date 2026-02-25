'use client';

import Link from 'next/link';
import CentralV2 from '@/components/central-v2';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        // Redirect to dashboard after a short delay to show the main component
        setTimeout(() => router.push('/dashboard'), 2000);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Central v2.0</h1>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Auth Links */}
      <div className="absolute top-4 right-4 z-50 flex gap-3">
        {isAuthenticated ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Dashboard
          </button>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Registrarse
            </Link>
          </>
        )}
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>⚙️</span>
        </button>
      </div>

      {/* Admin Portal Link */}
      {showAdmin && (
        <div className="absolute top-16 right-4 z-50 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg">
          <div className="space-y-3">
            <div>
              <p className="text-slate-400 text-sm mb-2">Panel Admin (Demo)</p>
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
