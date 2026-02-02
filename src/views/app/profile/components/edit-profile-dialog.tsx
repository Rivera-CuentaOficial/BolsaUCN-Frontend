"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GetUserProfileDTO } from "@/services/profileService";
import { Save, X } from "lucide-react";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: GetUserProfileDTO;
  formData: {
    userName: string;
    firstName: string;
    lastName: string;
    rut: string;
    email: string;
    phoneNumber: string;
    aboutMe: string;
  };
  fieldErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSave: () => Promise<boolean>;
  isSaving: boolean;
}

export function EditProfileDialog({
  isOpen,
  onClose,
  formData,
  fieldErrors,
  handleChange,
  handleSave,
  isSaving,
}: EditProfileDialogProps) {
  const handleSaveClick = async () => {
    const success = await handleSave();
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre de usuario
              </label>
              <Input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                  fieldErrors.userName
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {fieldErrors.userName && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.userName}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                  fieldErrors.firstName
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {fieldErrors.firstName && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Apellido
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                  fieldErrors.lastName
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {fieldErrors.lastName && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Correo electrónico
              </label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Teléfono
              </label>
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                  fieldErrors.phoneNumber
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {fieldErrors.phoneNumber && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.phoneNumber}</p>
              )}
            </div>

            {/* About Me */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sobre mí
              </label>
              <Textarea
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                rows={6}
                maxLength={500}
                className={`resize-y min-h-32 px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                  fieldErrors.aboutMe
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                placeholder="Escribe sobre ti..."
              />
              {fieldErrors.aboutMe && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.aboutMe}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}