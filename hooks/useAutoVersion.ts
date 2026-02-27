import { useEffect, useState } from 'react';

export function useAutoVersion() {
  const [version, setVersion] = useState<string>('5.1.0');
  const [loading, setLoading] = useState(true);

  // Cargar versión inicial
  useEffect(() => {
    const loadVersion = async () => {
      try {
        const res = await fetch('/api/version');
        if (res.ok) {
          const data = await res.json();
          if (data.version) {
            setVersion(data.version);
          }
        }
      } catch (error) {
        console.log('[v0] Error loading version:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVersion();
  }, []);

  // Función para incrementar versión
  const incrementVersion = async (type: 'major' | 'minor' | 'patch' = 'patch') => {
    try {
      const res = await fetch('/api/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment', type }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.newVersion) {
          setVersion(data.newVersion);
          return data.newVersion;
        }
      }
    } catch (error) {
      console.log('[v0] Error incrementing version:', error);
    }
    return null;
  };

  // Función para resetear versión
  const resetVersion = async () => {
    try {
      const res = await fetch('/api/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (res.ok) {
        setVersion('1.0.0');
        return '1.0.0';
      }
    } catch (error) {
      console.log('[v0] Error resetting version:', error);
    }
    return null;
  };

  return {
    version,
    loading,
    incrementVersion,
    resetVersion,
  };
}
