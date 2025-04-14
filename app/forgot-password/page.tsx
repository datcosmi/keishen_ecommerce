'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Recuperar contraseña</h1>
      {status === 'sent' ? (
        <p className="text-green-600">Correo enviado. Revisa tu bandeja de entrada 📬</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
          {status === 'error' && (
            <p className="text-red-600 text-sm">Error al enviar el correo.</p>
          )}
        </form>
      )}
    </div>
  );
}
