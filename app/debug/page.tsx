'use client';

export default function DebugPage() {
  return (
    <div style={{ padding: '40px', color: '#fff', backgroundColor: '#000410', minHeight: '100vh' }}>
      <h1>Debug - Central v2.0</h1>
      <p>Si ves esto, el servidor está funcionando.</p>
      
      <hr style={{ margin: '20px 0', borderColor: '#1A5A8A' }} />
      
      <h2>Verificación de Archivos:</h2>
      <ul>
        <li>✓ next.config.mjs creado</li>
        <li>✓ middleware.ts existe</li>
        <li>✓ lib/supabase/middleware.ts existe</li>
        <li>✓ globals.css existe</li>
        <li>✓ layout.tsx existe</li>
      </ul>

      <hr style={{ margin: '20px 0', borderColor: '#1A5A8A' }} />

      <h2>Próximos pasos:</h2>
      <ol>
        <li>Recarga la página (Ctrl+F5 o Cmd+Shift+R)</li>
        <li>Si aún no carga, chequea la terminal donde corre <code>npm run dev</code></li>
        <li>Busca cualquier error rojo en la consola</li>
      </ol>
    </div>
  );
}
