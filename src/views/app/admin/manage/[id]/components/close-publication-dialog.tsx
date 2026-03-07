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
import { validators } from "@/utils/AuthValidatorsUtil";
import { Label } from "@/components/ui/label";

interface ClosePublicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  onCancel?: () => void;
}

export function ClosePublicationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: ClosePublicationDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = () => {
    const trimmedReason = reason.trim();
    
    // Validation
    if (!trimmedReason) {
      setError("La razón de cierre es obligatoria");
      return;
    }
    
    if (trimmedReason.length < 10) {
      setError("La razón debe tener al menos 10 caracteres");
      return;
    }

    if (trimmedReason.length > 500) {
      setError("La razón no puede exceder los 500 caracteres");
      return;
    }

    const formatError = validators.comment(trimmedReason, "Razón de cierre");
    if (formatError) {
      setError(formatError);
      return;
    }

    onConfirm(trimmedReason);
    setReason(""); // Reset
    setError(null);
  };

  const handleCancel = () => {
    setReason(""); // Reset
    onCancel?.();
    onOpenChange(false);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    if (error) setError(null); 
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="!bg-white !border-black !text-black max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cerrar esta publicación?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción hará que la publicación deje de estar disponible para los usuarios.
            Debes proporcionar una razón clara para el cierre.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="close-reason" className="text-sm font-medium text-gray-700">
            Razón de cierre <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="close-reason"
            placeholder="Ej: Publicación duplicada, contenido inapropiado, etc."
            value={reason}
            onChange={handleReasonChange}
            className={`min-h-[100px] resize-none ${error ? "border-red-500 focus:border-red-500" : ""}`}
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
            Cerrar Publicación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}