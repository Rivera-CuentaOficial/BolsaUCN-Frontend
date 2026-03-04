// frontend/src/views/app/profile/components/dialog-verify-email.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Check, X, AlertCircle, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { profileService } from "@/services/profileService";

interface VerifyNewEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pendingEmail?: string;
}

export function VerifyNewEmailDialog({
  isOpen,
  onClose,
  onSuccess,
  pendingEmail,
}: VerifyNewEmailDialogProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    if (error) setError("");
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await profileService.verifyChangeEmail({
        verificationCode: code,
      });

      toast.success("Correo actualizado", {
        description: response.message || "Tu correo electrónico ha sido actualizado exitosamente",
      });

      onSuccess();
      onClose();
      setCode("");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Error al verificar el código";
      setError(errorMessage);
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await profileService.resendEmailVerification();
      
      toast.success("Código reenviado", {
        description: response.message || "Se ha enviado un nuevo código a tu correo",
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Error al reenviar el código";
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCode("");
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Verificar Nuevo Correo
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Ingresa el código de 6 dígitos que enviamos a
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pending Email Display */}
          {pendingEmail && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {pendingEmail}
                </p>
                <p className="text-xs text-slate-600">
                  Revisa tu bandeja de entrada y spam
                </p>
              </div>
            </div>
          )}

          {/* Code Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Código de verificación
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              className={`px-4 py-3 text-center text-2xl font-bold tracking-widest border rounded-xl bg-white ${
                error
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
              placeholder="000000"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            {code.length === 6 && !error && (
              <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Código completo
              </p>
            )}
          </div>

          {/* Resend Button */}
          <div className="flex justify-center">
            <button
              onClick={handleResend}
              disabled={isResending || isSubmitting}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
              {isResending ? "Enviando..." : "Reenviar código"}
            </button>
          </div>

          {/* Info Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-slate-600 text-xs">
              El código expira en <strong>24 horas</strong>. Si no recibes el correo, verifica tu carpeta de spam o intenta reenviarlo.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isSubmitting || code.length !== 6}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? "Verificando..." : "Verificar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}