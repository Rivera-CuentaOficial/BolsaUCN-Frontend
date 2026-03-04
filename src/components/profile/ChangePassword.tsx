"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { profileService } from "@/services/profileService";
import { validators } from "@/utils/AuthValidatorsUtil";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ChangePasswordDialog({
  open,
  onOpenChange,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    if (error) setError(null);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    // Contraseña actual
    if (!form.currentPassword) {
      errors.currentPassword = "La contraseña actual es requerida";
    }

    // Nueva contraseña
    const newPasswordError = validators.password(form.newPassword, "Nueva contraseña");
    if (newPasswordError) errors.newPassword = newPasswordError;

    // Confirmar nueva contraseña
    const confirmError = validators.confirmPassword(
      form.confirmNewPassword,
      form.newPassword
    );
    if (confirmError) errors.confirmNewPassword = confirmError;
    if (form.newPassword && form.currentPassword === form.newPassword) {
      errors.newPassword = "La nueva contraseña debe ser diferente de la actual";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const response = await profileService.changePassword({
        CurrentPassword: form.currentPassword,
        NewPassword: form.newPassword,
        ConfirmNewPassword: form.confirmNewPassword,
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setFieldErrors({});
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
      onOpenChange(false);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error al cambiar la contraseña", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        err.message ||
        "Error al cambiar la contraseña";

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setFieldErrors({});
      setError(null);
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-600" />
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm">
              Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label 
                htmlFor="currentPassword" 
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Contraseña Actual
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={handleChange}
                  className={`px-4 py-3 pr-12 border rounded-xl bg-white text-slate-700 transition-colors ${
                    fieldErrors.currentPassword
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  disabled={submitting}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  tabIndex={-1}
                  disabled={submitting}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.currentPassword && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                  {fieldErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label 
                htmlFor="newPassword" 
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Nueva Contraseña
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={form.newPassword}
                  onChange={handleChange}
                  className={`px-4 py-3 pr-12 border rounded-xl bg-white text-slate-700 transition-colors ${
                    fieldErrors.newPassword
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  disabled={submitting}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  tabIndex={-1}
                  disabled={submitting}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.newPassword && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                  {fieldErrors.newPassword}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1.5">
                Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label 
                htmlFor="confirmNewPassword" 
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={form.confirmNewPassword}
                  onChange={handleChange}
                  className={`px-4 py-3 pr-12 border rounded-xl bg-white text-slate-700 transition-colors ${
                    fieldErrors.confirmNewPassword
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  disabled={submitting}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  tabIndex={-1}
                  disabled={submitting}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmNewPassword && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                  {fieldErrors.confirmNewPassword}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition disabled:opacity-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition shadow-lg disabled:opacity-50"
            >
              {submitting ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}