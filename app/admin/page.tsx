'use client';

import { useEffect } from 'react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { ApiKeyManager } from '@/components/api-key-manager';
import { NotificationCenter } from '@/components/notification-center';
import { AdminSystemContext } from '@/lib/admin-init';

export default function AdminPage() {
  useEffect(() => {
    // Initialize admin system on first load
    AdminSystemContext.initialize();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Top Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">El Jefazo OS</h1>
            <p className="text-slate-400 text-xs">Panel de Administración Avanzado</p>
          </div>
          <div className="flex items-center gap-6">
            <NotificationCenter />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs Navigation */}
        <div className="mb-8">
          <AdminDashboard />
        </div>

        {/* API Management Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Integración con Terceros</h2>
          <ApiKeyManager />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            El Jefazo OS v2.0.0 • {new Date().getFullYear()} • Administración Centralizada
          </p>
        </div>
      </div>
    </div>
  );
}
