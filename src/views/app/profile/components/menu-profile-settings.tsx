"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { Edit2, Lock, Mail, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  EditProfileDialog,
  ChangePasswordDialog,
  UpdateEmailDialog,
} from "."
import { GetUserProfileDTO } from "@/services/profileService";

interface ProfileSettingsMenuProps {
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

export function ProfileSettingsMenu({
  isOpen,
  onClose,
  profile,
  formData,
  fieldErrors,
  handleChange,
  handleSave,
  isSaving,
  userType,
}: ProfileSettingsMenuProps) {
  const [activeDialog, setActiveDialog] = useState<"edit" | "password" | "email" | null>(null);

  const handleOpenDialog = (dialog: "edit" | "password" | "email") => {
    setActiveDialog(dialog);
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
  };

  const handleCloseAll = () => {
    handleCloseDialog();
    onClose();
  };

  const menuItems = [
    {
      id: "edit" as const,
      icon: Edit2,
      title: "Editar Perfil",
      description: "Actualiza tu nombre, usuario y biografía",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "email" as const,
      icon: Mail,
      title: "Cambiar Correo",
      description: "Actualiza tu dirección de correo electrónico",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "password" as const,
      icon: Lock,
      title: "Cambiar Contraseña",
      description: "Actualiza tu contraseña de acceso",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <>
      <Dialog open={isOpen && activeDialog === null} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Configuración del Perfil
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Selecciona qué deseas actualizar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpenDialog(item.id)}
                  className="w-full group"
                >
                  <div className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl transition-all hover:shadow-md">
                    <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-slate-900 text-base">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        isOpen={activeDialog === "edit"}
        onClose={handleCloseDialog}
        profile={profile}
        formData={formData}
        fieldErrors={fieldErrors}
        handleChange={handleChange}
        handleSave={async () => {
          const success = await handleSave();
          if (success) {
            handleCloseAll();
          }
          return success;
        }}
        isSaving={isSaving}
        userType={userType}
      />

      {/* Update Email Dialog */}
      <UpdateEmailDialog
        isOpen={activeDialog === "email"}
        onClose={handleCloseDialog}
        currentEmail={profile.email}
        userType={userType}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={activeDialog === "password"}
        onClose={handleCloseDialog}
      />
    </>
  );
}