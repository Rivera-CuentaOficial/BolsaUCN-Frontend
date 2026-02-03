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
import { Save, X, AtSign, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { profileService } from "@/services/profileService";

interface UpdateEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerifyDialog: (newEmail: string) => void;
  currentEmail: string;
  userType?: string;
}

export function UpdateEmailDialog({
  isOpen,
  onClose,
  onOpenVerifyDialog,
  currentEmail,
  userType,
}: UpdateEmailDialogProps) {
  const isStudent = userType === "Estudiante";
  const STUDENT_DOMAIN = "@alumnos.ucn.cl";

  const [emailLocal, setEmailLocal] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailLocal(value);
    
    if (fieldErrors.email) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.email;
        return updated;
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    
    if (fieldErrors.password) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.password;
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!emailLocal.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else if (isStudent) {
      const fullEmail = emailLocal + STUDENT_DOMAIN;
      if (fullEmail === currentEmail) {
        errors.email = "El nuevo correo debe ser diferente al actual";
      }
    } else {
      if (emailLocal === currentEmail) {
        errors.email = "El nuevo correo debe ser diferente al actual";
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailLocal)) {
        errors.email = "Formato de correo inválido";
      }
    }

    if (!password.trim()) {
      errors.password = "La contraseña es requerida para confirmar el cambio";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const newEmail = isStudent ? emailLocal + STUDENT_DOMAIN : emailLocal;
      const response = await profileService.changeEmail({newEmail: newEmail, currentPassword: password});

      toast.success("Codigo enviada", {
        description: response.message ||"Se ha enviado un correo de verificación a tu nueva dirección",
      });

      setEmailLocal("");
      setPassword("");
      setFieldErrors({});

      onClose();
      onOpenVerifyDialog(newEmail);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Error al actualizar el correo";
      setFieldErrors({ submit: errorMessage });
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setEmailLocal("");
    setPassword("");
    setFieldErrors({});
  };

  const fullNewEmail = isStudent ? emailLocal + STUDENT_DOMAIN : emailLocal;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Actualizar Correo Electrónico
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Se enviará un correo de verificación a tu nueva dirección
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Email Display */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Correo actual
            </label>
            <div className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600">
              {currentEmail}
            </div>
          </div>

          {/* New Email Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nuevo correo electrónico
              {isStudent && (
                <span className="text-xs font-normal text-slate-500 ml-2">
                  (Dominio UCN)
                </span>
              )}
            </label>
            {isStudent ? (
              <div className="relative">
                <Input
                  value={emailLocal}
                  onChange={handleEmailChange}
                  className={`px-4 py-3 pr-40 border rounded-xl bg-white text-slate-700 ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="tu.nombre"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 pointer-events-none">
                  <AtSign className="w-4 h-4" />
                  <span className="text-sm font-medium">alumnos.ucn.cl</span>
                </div>
              </div>
            ) : (
              <Input
                value={emailLocal}
                onChange={handleEmailChange}
                className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                placeholder="correo@ejemplo.com"
              />
            )}
            {fieldErrors.email && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.email}
              </p>
            )}
            {!fieldErrors.email && emailLocal && (
              <p className="text-slate-500 text-xs mt-1.5">
                Nuevo correo: <span className="font-medium">{fullNewEmail}</span>
              </p>
            )}
          </div>

          {/* Password Confirmation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Confirma tu contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                fieldErrors.password
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
              placeholder="Tu contraseña actual"
            />
            {fieldErrors.password && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {fieldErrors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.submit}
              </p>
            </div>
          )}

          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-amber-800 text-xs">
              <strong>Importante:</strong> Deberás verificar tu nuevo correo antes de poder usarlo para iniciar sesión.
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Enviando..." : "Actualizar Correo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}