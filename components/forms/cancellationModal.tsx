import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { RefreshCw } from "lucide-react";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    orderId: number,
    status: string,
    comments: string
  ) => Promise<void>;
  orderId: number;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
}) => {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onConfirm(orderId, "cancelado", comments);
    setIsSubmitting(false);
    setComments("");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">
            Cancelar pedido #{orderId}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Por favor, ingrese el motivo de la cancelación:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mb-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Motivo de cancelación..."
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-200">
            Volver
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Confirmar cancelación"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
