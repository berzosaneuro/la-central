'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Central v2.0</h1>
        <p className="text-slate-300 mb-8">Sistema en construcción</p>
        <div className="space-y-3">
          <a href="/auth/login" className="block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Login
          </a>
          <a href="/auth/signup" className="block px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            Registrarse
          </a>
        </div>
      </div>
    </div>
  );
}
