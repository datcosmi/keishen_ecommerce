"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NavbarBlack from "@/components/navbarBlack";
import Footer from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (!token) {
      alert("Token faltante. Redirigiendo...");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Token inválido.");
      return;
    }

    console.log("ENVIANDO:", { token, newPassword });

    // const passwordRegex =
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.\-])[A-Za-z\d@$!%*?&_.\-]{8,}$/;

    // if (!passwordRegex.test(newPassword)) {
    //     alert(
    //         'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.'
    //     )
    // }

    setStatus("loading");

    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (res.ok) {
      setStatus("success");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarBlack />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Restablecer contraseña</CardTitle>
            <CardDescription>
              Ingresá tu nueva contraseña para acceder nuevamente a tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "success" ? (
              <Alert>
                <AlertTitle>Contraseña actualizada</AlertTitle>
                <AlertDescription>
                  Serás redirigido al login en unos segundos...
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                {status === "error" && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Ocurrió un error al cambiar la contraseña. Intentá
                      nuevamente.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full"
                  type="submit"
                  disabled={status === "loading"}
                >
                  {status === "loading"
                    ? "Actualizando..."
                    : "Cambiar contraseña"}
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
