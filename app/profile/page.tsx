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
  PlusCircle,
  Pencil,
  Trash2,
  MapPin,
  Home,
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

interface Address {
  id_address: number;
  user_id: number;
  calle: string;
  numero_ext: string;
  numero_int: string | null;
  colonia: string;
  codigo_postal: number;
  ciudad: string;
  estado: string;
  pais: string;
}

interface AddressFormData {
  id_address?: number;
  calle: string;
  numero_ext: string;
  numero_int: string;
  colonia: string;
  codigo_postal: string;
  ciudad: string;
  estado: string;
  pais: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState<number | null>(null);
  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    calle: "",
    numero_ext: "",
    numero_int: "",
    colonia: "",
    codigo_postal: "",
    ciudad: "",
    estado: "",
    pais: "México",
  });

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

  // Fetch addresses from API
  const fetchAddresses = async () => {
    if (!authUser?.id_user) return;

    try {
      setIsAddressesLoading(true);
      setAddressError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/users/${authUser.id_user}/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddressError("Unable to load your addresses. Please try again later.");
    } finally {
      setIsAddressesLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
  }, [authUser?.id_user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFormData({
      ...addressFormData,
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

  const handleAddAddress = async () => {
    if (!authUser?.id_user) return;

    try {
      setIsAddressesLoading(true);
      setAddressError(null);

      const addressData = {
        ...addressFormData,
        codigo_postal: parseInt(addressFormData.codigo_postal),
        user_id: authUser.id_user,
      };

      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error("Failed to add address");
      }

      // Reset form and fetch updated addresses
      resetAddressForm();
      await fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
      setAddressError("Failed to add your address. Please try again.");
    } finally {
      setIsAddressesLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!currentAddressId) return;

    try {
      setIsAddressesLoading(true);
      setAddressError(null);

      const addressData = {
        ...addressFormData,
        codigo_postal: parseInt(addressFormData.codigo_postal),
        user_id: authUser?.id_user,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/addresses/${currentAddressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(addressData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update address");
      }

      // Reset form and fetch updated addresses
      resetAddressForm();
      await fetchAddresses();
    } catch (error) {
      console.error("Error updating address:", error);
      setAddressError("Failed to update your address. Please try again.");
    } finally {
      setIsAddressesLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      setIsAddressesLoading(true);
      setAddressError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      // Fetch updated addresses
      await fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      setAddressError("Failed to delete your address. Please try again.");
    } finally {
      setIsAddressesLoading(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressFormData({
      calle: address.calle,
      numero_ext: address.numero_ext,
      numero_int: address.numero_int || "",
      colonia: address.colonia,
      codigo_postal: address.codigo_postal.toString(),
      ciudad: address.ciudad,
      estado: address.estado,
      pais: address.pais,
    });
    setCurrentAddressId(address.id_address);
    setIsAddingAddress(false);
    setIsEditingAddress(true);
  };

  const resetAddressForm = () => {
    setAddressFormData({
      calle: "",
      numero_ext: "",
      numero_int: "",
      colonia: "",
      codigo_postal: "",
      ciudad: "",
      estado: "",
      pais: "México",
    });
    setCurrentAddressId(null);
    setIsAddingAddress(false);
    setIsEditingAddress(false);
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
            <TabsList
              className={`grid w-full ${userData?.role === "cliente" ? "grid-cols-3" : "grid-cols-2"}`}
            >
              <TabsTrigger value="profile">Información Personal</TabsTrigger>
              {userData?.role === "cliente" && (
                <TabsTrigger value="addresses">Direcciones</TabsTrigger>
              )}
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

            <TabsContent value="addresses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Direcciones</CardTitle>
                  <CardDescription>
                    Gestiona tus direcciones de envío y facturación
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {addressError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{addressError}</AlertDescription>
                    </Alert>
                  )}

                  {isAddressesLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {addresses.length === 0 &&
                      !isAddingAddress &&
                      !isEditingAddress ? (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium">
                            No tienes direcciones registradas
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Agrega tu primera dirección para envíos y
                            facturación
                          </p>
                          <Button
                            onClick={() => setIsAddingAddress(true)}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Agregar Dirección
                          </Button>
                        </div>
                      ) : (
                        <>
                          {!isAddingAddress && !isEditingAddress && (
                            <div className="flex justify-end mb-4">
                              <Button
                                onClick={() => setIsAddingAddress(true)}
                                size="sm"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Agregar Dirección
                              </Button>
                            </div>
                          )}

                          {(isAddingAddress || isEditingAddress) && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                              <h3 className="text-lg font-medium mb-4">
                                {isAddingAddress
                                  ? "Agregar Nueva Dirección"
                                  : "Editar Dirección"}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="calle">Calle</Label>
                                  <Input
                                    id="calle"
                                    name="calle"
                                    value={addressFormData.calle}
                                    onChange={handleAddressInputChange}
                                    placeholder="Calle"
                                    required
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="numero_ext">
                                      Número Exterior
                                    </Label>
                                    <Input
                                      id="numero_ext"
                                      name="numero_ext"
                                      value={addressFormData.numero_ext}
                                      onChange={handleAddressInputChange}
                                      placeholder="Núm. Ext."
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="numero_int">
                                      Número Interior
                                    </Label>
                                    <Input
                                      id="numero_int"
                                      name="numero_int"
                                      value={addressFormData.numero_int || ""}
                                      onChange={handleAddressInputChange}
                                      placeholder="Núm. Int."
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="colonia">Colonia</Label>
                                  <Input
                                    id="colonia"
                                    name="colonia"
                                    value={addressFormData.colonia}
                                    onChange={handleAddressInputChange}
                                    placeholder="Colonia"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="codigo_postal">
                                    Código Postal
                                  </Label>
                                  <Input
                                    id="codigo_postal"
                                    name="codigo_postal"
                                    value={addressFormData.codigo_postal}
                                    onChange={handleAddressInputChange}
                                    placeholder="Código Postal"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="ciudad">Ciudad</Label>
                                  <Input
                                    id="ciudad"
                                    name="ciudad"
                                    value={addressFormData.ciudad}
                                    onChange={handleAddressInputChange}
                                    placeholder="Ciudad"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="estado">Estado</Label>
                                  <Input
                                    id="estado"
                                    name="estado"
                                    value={addressFormData.estado}
                                    onChange={handleAddressInputChange}
                                    placeholder="Estado"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="pais">País</Label>
                                  <Input
                                    id="pais"
                                    name="pais"
                                    value={addressFormData.pais}
                                    onChange={handleAddressInputChange}
                                    placeholder="País"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end mt-6 space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={resetAddressForm}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={
                                    isAddingAddress
                                      ? handleAddAddress
                                      : handleUpdateAddress
                                  }
                                  disabled={isAddressesLoading}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {isAddingAddress ? "Agregar" : "Actualizar"}
                                </Button>
                              </div>
                            </div>
                          )}

                          {!isAddingAddress &&
                            !isEditingAddress &&
                            addresses.map((address) => (
                              <div
                                key={address.id_address}
                                className="border rounded-lg p-4 mb-4 hover:border-gray-400 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center">
                                    <Home className="h-5 w-5 text-gray-500 mr-2" />
                                    <h3 className="font-medium">
                                      {address.calle} {address.numero_ext}
                                      {address.numero_int
                                        ? `, Int: ${address.numero_int}`
                                        : ""}
                                    </h3>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditAddress(address)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteAddress(address.id_address)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p>
                                    Colonia {address.colonia}, C.P.{" "}
                                    {address.codigo_postal}
                                  </p>
                                  <p>
                                    {address.ciudad}, {address.estado},{" "}
                                    {address.pais}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                    </>
                  )}
                </CardContent>
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

        <div className="grid grid-cols-3 gap-2 mb-6">
          <Skeleton className="h-10" />
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
