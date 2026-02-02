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
import { Save, X, AtSign, Phone } from "lucide-react";
import { useState, useEffect } from "react";

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
  userType?: string;
}

export function EditProfileDialog({
  isOpen,
  onClose,
  formData,
  fieldErrors,
  handleChange,
  handleSave,
  isSaving,
  userType,
}: EditProfileDialogProps) {
  const isStudent = userType === "Estudiante";
  const STUDENT_DOMAIN = "@alumnos.ucn.cl";
  const PHONE_PREFIX = "+56";

  const [emailLocal, setEmailLocal] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");

  useEffect(() => {
    if (isStudent && formData.email) {
      const local = formData.email.replace(STUDENT_DOMAIN, "");
      setEmailLocal(local);
    } else {
      setEmailLocal(formData.email);
    }
  }, [formData.email, isStudent]);
  useEffect(() => {
    if (formData.phoneNumber) {
      const local = formData.phoneNumber.replace(PHONE_PREFIX, "").trim();
      setPhoneLocal(local);
    } else {
      setPhoneLocal("");
    }
  }, [formData.phoneNumber]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isStudent) {
      setEmailLocal(value);
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name: "email",
          value: value + STUDENT_DOMAIN,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      handleChange(syntheticEvent);
    } else {
      setEmailLocal(value);
      handleChange(e);
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, "");

    setPhoneLocal(digits);

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: "phoneNumber",
        value: digits ? PHONE_PREFIX + digits : "",
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(syntheticEvent);
  }

  const formatPhoneDisplay = (phone: string): string => {
    // Formatea a 9 1234 5678
    if (phone.length <= 1) return phone;
    if (phone.length <= 5) return `${phone.slice(0, 1)} ${phone.slice(1)}`;
    return `${phone.slice(0, 1)} ${phone.slice(1, 5)} ${phone.slice(5)}`;
  };

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
                {isStudent && (
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    (Dominio UCN)
                  </span>
                )}
              </label>
              {isStudent ? (
                <div className="relative">
                  <Input
                    name="email"
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
                  name="email"
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
                <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
              )}
              {isStudent && !fieldErrors.email && (
                <p className="text-slate-500 text-xs mt-1.5">
                  Tu correo completo: <span className="font-medium">{formData.email}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Teléfono
                <span className="text-xs font-normal text-slate-500 ml-2">
                  (Código de país +56)
                </span>
              </label>
              <div className="relative">
                <Input
                  name="phoneNumber"
                  type="tel"
                  value={formatPhoneDisplay(phoneLocal)}
                  onChange={handlePhoneChange}
                  className={`px-4 py-3 pl-20 border rounded-xl bg-white text-slate-700 ${
                    fieldErrors.phoneNumber
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="9 1234 5678"
                  maxLength={11}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 pointer-events-none">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-semibold">+56</span>
                </div>
              </div>
              {fieldErrors.phoneNumber && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.phoneNumber}</p>
              )}
              {!fieldErrors.phoneNumber && phoneLocal && (
                <p className="text-slate-500 text-xs mt-1.5">
                  Tu teléfono completo: <span className="font-medium">{formData.phoneNumber}</span>
                </p>
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