"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import NavbarBlack from "@/components/navbarBlack";
import Footer from "@/components/footer";
import { useSession } from "next-auth/react";

interface UserData {
  id_user: number;
  name: string;
  surname: string;
  email: string;
  pass: string | null;
  phone: string | null;
  role: string;
  provider: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({});

  // Get token from session
  const { data: session } = useSession();
  const token = session?.accessToken;

  // Fetch user data from API
  const fetchUserData = async () => {
    if (!authUser?.id_user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/users/${authUser.id_user}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
      setFormData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(
        "Unable to load your profile information. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [authUser?.id_user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveChanges = async () => {
    if (!authUser?.id_user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/users/${authUser.id_user}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update your profile. Please try again.");
    } finally {
      setIsLoading(false);
      fetchUserData();
    }
  };

  const handleCancelEdit = () => {
    setFormData(userData || {});
    setIsEditing(false);
  };

  if (isLoading && !userData) {
    return <ProfileSkeleton />;
  }

  if (error && !userData) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarBlack />
      <div className="container mx-auto py-10 px-4 pb-30">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Información Personal</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Gestiona tus datos personales y de contacto
                    </CardDescription>
                  </div>

                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData?.name} ${userData?.surname}`}
                    />
                    <AvatarFallback>
                      {userData?.name?.charAt(0)}
                      {userData?.surname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </CardHeader>

                <CardContent className="space-y-6">
                  {userData?.provider && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center text-sm">
                        <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          Cuenta vinculada con{" "}
                          <span className="font-medium capitalize">
                            {userData.provider}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          name="name"
                          value={formData.name || ""}
                          onChange={handleInputChange}
                          placeholder="Tu nombre"
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 rounded-md border border-input bg-gray-50">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{userData?.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surname">Apellido</Label>
                      {isEditing ? (
                        <Input
                          id="surname"
                          name="surname"
                          value={formData.surname || ""}
                          onChange={handleInputChange}
                          placeholder="Tu apellido"
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 rounded-md border border-input bg-gray-50">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{userData?.surname}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border border-input bg-gray-50">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{userData?.email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleInputChange}
                          placeholder="Tu número de teléfono"
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 rounded-md border border-input bg-gray-50">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{userData?.phone || "No especificado"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label htmlFor="role">Tipo de Cuenta</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border border-input bg-gray-50">
                      <Shield className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="capitalize">{userData?.role}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveChanges} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad de la Cuenta</CardTitle>
                  <CardDescription>
                    Gestiona tu contraseña y preferencias de seguridad
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {userData?.provider ? (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Cuenta externa</AlertTitle>
                      <AlertDescription>
                        Tu cuenta está vinculada con {userData.provider}. No
                        necesitas gestionar tu contraseña.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          Contraseña Actual
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirmar Nueva Contraseña
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="justify-end">
                  {!userData?.provider && (
                    <Button disabled={userData?.provider !== null}>
                      Actualizar Contraseña
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64 mb-6" />

        <div className="grid grid-cols-2 gap-2 mb-6">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-16 w-16 rounded-full" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>

            <Skeleton className="h-px w-full my-4" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
