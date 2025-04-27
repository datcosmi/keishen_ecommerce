"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "next-auth/react";
import { RatingData } from "@/types/ratingTypes";

interface RatingSectionProps {
  productId: any | any[];
  API_BASE_URL: any;
}

export default function RatingSection({
  productId,
  API_BASE_URL,
}: RatingSectionProps) {
  const [rating, setRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userRatingId, setUserRatingId] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [ratingHover, setRatingHover] = useState<number | null>(null);
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  // Authentication
  const { isAuthenticated, user } = useAuth();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const router = useRouter();

  useEffect(() => {
    if (productId) {
      fetchRatings(productId);
      fetchProductRatings(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (user?.id_user) {
      fetchUserRating();
    }
  }, [user]);

  const fetchRatings = async (productId: string | string[]) => {
    // Ensure productId is a string
    const idParam =
      typeof productId === "string"
        ? productId
        : Array.isArray(productId)
          ? productId[0]
          : String(productId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ratings/product/${idParam}/average`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ratings");
      }
      const data = await response.json();
      setRating(data.average);
      setReviewCount(data.count);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      // Fall back to default values
      setRating(0);
      setReviewCount(0);
    }
  };

  const fetchProductRatings = async (productId: string | string[]) => {
    // Ensure productId is a string
    const idParam =
      typeof productId === "string"
        ? productId
        : Array.isArray(productId)
          ? productId[0]
          : String(productId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ratings/product/${idParam}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch product ratings");
      }
      const data = (await response.json()) as RatingData[];

      // Count ratings by star value
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach((rating) => {
        if (rating.rating >= 1 && rating.rating <= 5) {
          counts[rating.rating as 1 | 2 | 3 | 4 | 5]++;
        }
      });

      setRatingCounts(counts);
    } catch (error) {
      console.error("Error fetching product ratings:", error);
    }
  };

  const fetchUserRating = async () => {
    if (!isAuthenticated || !user?.id_user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ratings/user/${user.id_user}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user ratings");
      }

      const ratings = await response.json();

      // Find if user has rated this product
      const existingRating = ratings.find(
        (r: any) => r.prod_id === Number(productId)
      );

      if (existingRating) {
        setUserRating(existingRating.rating);
        setUserRatingId(existingRating.id_rating);
      }
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };

  const submitRating = async (selectedRating: number) => {
    if (!isAuthenticated || !user) {
      toast.error("Por favor inicia sesión para calificar este producto");
      router.push("/login");
      return;
    }

    // Ensure id is properly type-cast as a number
    const validProductId =
      typeof productId === "string"
        ? parseInt(productId)
        : Array.isArray(productId)
          ? parseInt(productId[0])
          : null;

    if (validProductId === null) {
      toast.error("ID de producto inválido");
      return;
    }

    try {
      setIsSubmittingRating(true);

      // If there's an existing rating, update it
      if (userRatingId) {
        await updateRating(selectedRating);
      } else {
        // Otherwise create a new rating
        const currentDate = new Date().toISOString();

        const response = await fetch(`${API_BASE_URL}/api/ratings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id_user,
            prod_id: validProductId,
            rating: selectedRating,
            created_at: currentDate,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (
            data.error === "User has already rated this product" &&
            data.existing_rating
          ) {
            // If user has already rated, update our state with that information
            setUserRating(data.existing_rating.rating);
            setUserRatingId(data.existing_rating.id_rating);
            toast.info("Ya has calificado este producto anteriormente");
          } else {
            throw new Error(data.error || "Failed to submit rating");
          }
        } else {
          setUserRating(selectedRating);
          setUserRatingId(data.id_rating);
          toast.success("¡Gracias por tu calificación!");

          // Refresh the average rating
          fetchRatings(productId);
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Error al enviar tu calificación");
    } finally {
      setIsSubmittingRating(false);
      setShowRatingModal(false);
    }
  };

  const updateRating = async (selectedRating: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ratings/${userRatingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: selectedRating,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update rating");
      }

      setUserRating(selectedRating);
      toast.success("Tu calificación ha sido actualizada");

      // Refresh the average rating
      fetchRatings(productId);
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error("Error al actualizar tu calificación");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-gray-500">
          {rating > 0 ? rating.toFixed(1) : "Sin calificaciones"}{" "}
          {reviewCount > 0 ? `(${reviewCount} calificaciones)` : ""}
        </span>

        {/* Rating button */}
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
          onClick={() => setShowRatingModal(true)}
          disabled={
            !isAuthenticated ||
            user?.role === "vendedor" ||
            user?.role === "superadmin" ||
            user?.role === "admin_tienda"
          }
        >
          {userRating ? "Editar calificación" : "Calificar producto"}
        </Button>
      </div>

      {/* User's current rating display */}
      {userRating && (
        <div className="mt-4 flex items-center">
          <span className="text-sm text-gray-600 mr-2">Tu calificación:</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < userRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rating distribution */}
      <div className="mt-4 mb-6">
        <h3 className="font-medium text-sm mb-2">
          Distribución de calificaciones
        </h3>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((starValue) => (
            <div key={starValue} className="flex items-center gap-1.5">
              <div className="flex items-center min-w-[50px] text-xs">
                {starValue}
                <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full flex-grow">
                <div
                  className="h-1.5 bg-yellow-400 rounded-full"
                  style={{
                    width: `${reviewCount > 0 ? (ratingCounts[starValue] / reviewCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 min-w-[30px]">
                {ratingCounts[starValue]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 p-6">
            <h3 className="text-xl font-semibold mb-4">
              {userRating
                ? "Actualizar calificación"
                : "Calificar este producto"}
            </h3>
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-10 w-10 cursor-pointer transition-all ${
                    (ratingHover || userRating || 0) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                  onMouseEnter={() => setRatingHover(star)}
                  onMouseLeave={() => setRatingHover(null)}
                  onClick={() => submitRating(star)}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRatingModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => submitRating(ratingHover || userRating || 5)}
                disabled={isSubmittingRating}
                className="bg-black hover:bg-gray-800"
              >
                {isSubmittingRating
                  ? "Enviando..."
                  : userRating
                    ? "Actualizar"
                    : "Enviar"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
