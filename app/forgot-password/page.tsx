'use client';

import { useState } from 'react';
import NavbarBlack from "@/components/navbarBlack";
import Footer from "@/components/footer";
import { Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarBlack />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Recuperar contraseña</CardTitle>
            <CardDescription>
              Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'sent' ? (
              <Alert>
                <AlertTitle>Correo enviado</AlertTitle>
                <AlertDescription>
                  Revisa tu bandeja de entrada para restablecer tu contraseña
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {status === 'error' && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>No se pudo enviar el correo. Intentalo más tarde.</AlertDescription>
                  </Alert>
                )}
                <Button className="w-full" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
