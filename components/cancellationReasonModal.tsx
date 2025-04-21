import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XCircle } from "lucide-react";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comments: string) => Promise<void>;
  pedidoId: number;
}

export const CancellationReasonModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pedidoId,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    await onConfirm(reason);
    setIsSubmitting(false);
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-500" />
            Cancelar Pedido #{pedidoId}
          </DialogTitle>
          <DialogDescription>
            Por favor proporciona un motivo para la cancelación. Esta
            información nos ayuda a mejorar nuestro servicio.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Escribe el motivo de la cancelación aquí..."
            className="min-h-[120px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar Cancelación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
