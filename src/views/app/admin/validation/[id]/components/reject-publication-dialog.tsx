 "use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RejectPublicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  onCancel?: () => void;
}

export function RejectPublicationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: RejectPublicationDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    const trimmedReason = reason.trim();
    
    // Validation
    if (!trimmedReason) {
      setError("La razón de rechazo es obligatoria");
      return;
    }
    
    if (trimmedReason.length < 10) {
      setError("La razón debe tener al menos 10 caracteres");
      return;
    }

    onConfirm(trimmedReason);
    setReason(""); // Reset
    setError(null);
  };

  const handleCancel = () => {
    setReason(""); // Reset
    setError(null);
    onCancel?.();
    onOpenChange(false);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    if (error) setError(null); // Clear error when user types
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="!bg-white !border-black !text-black max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Rechazar esta publicación?</AlertDialogTitle>
          <AlertDialogDescription>
            La publicación será descartada y el usuario será notificado.
            Debes proporcionar una razón clara para ayudar al usuario a entender la decisión.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="rejection-reason" className="text-sm font-medium text-gray-700">
            Razón de rechazo <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="rejection-reason"
            placeholder="Ej: La publicación contiene información incorrecta, no cumple con las políticas, etc."
            value={reason}
            onChange={handleReasonChange}
            className={`min-h-[120px] resize-none ${error ? "border-red-500 focus:border-red-500" : ""}`}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {reason.length}/500 caracteres (mínimo 10)
            </p>
            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer"
            onClick={handleCancel}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirm}
          >
            Rechazar Publicación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}