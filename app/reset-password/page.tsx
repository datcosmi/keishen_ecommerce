'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!token) {
      alert('Token faltante. Redirigiendo...');
      router.push('/forgot-password');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert('Token inválido.');
      return;
    }

    console.log('ENVIANDO:', { token, newPassword });

    // const passwordRegex =
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.\-])[A-Za-z\d@$!%*?&_.\-]{8,}$/;

    // if (!passwordRegex.test(newPassword)) {
    //     alert(
    //         'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.'
    //     )
    // }

    setStatus('loading');

    const res = await fetch('http://localhost:3001/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (res.ok) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Restablecer contraseña</h1>

      {status === 'success' ? (
        <p className="text-green-600">¡Contraseña actualizada! Ya puedes iniciar sesión </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
          {status === 'error' && (
            <p className="text-red-600 text-sm">Error al cambiar la contraseña.</p>
          )}
        </form>
      )}
    </div>
  );
}
