"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit2, Eye, EyeOff, XCircle, ChevronRight } from "lucide-react";
import type { MyPublicationDetails } from "@/models/responses";

interface BuySellActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  publication: MyPublicationDetails;
  onEditClick: () => void;
  onToggleVisibilityClick: () => void;
  onCancelClick: () => void;
  isTogglingVisibility: boolean;
}

export function BuySellActionsMenu({
  isOpen,
  onClose,
  publication,
  onEditClick,
  onToggleVisibilityClick,
  onCancelClick,
  isTogglingVisibility,
}: BuySellActionsMenuProps) {
  const isVisible = publication.availability === "Disponible";
  const isAccepted = publication.approvalStatus === "Aceptada";

  const menuItems = [
    {
      id: "edit",
      icon: Edit2,
      title: "Editar Publicación",
      description: "Actualiza los detalles de tu publicación",
      color: "from-purple-500 to-pink-500",
      onClick: () => {
        onEditClick();
        onClose();
      },
      show: true,
    },
    {
      id: "visibility",
      icon: isVisible ? EyeOff : Eye,
      title: isVisible ? "Ocultar Publicación" : "Mostrar Publicación",
      description: isVisible
        ? "La publicación desaparecerá de las búsquedas"
        : "La publicación será visible en las búsquedas",
      color: isVisible ? "from-orange-500 to-red-500" : "from-green-500 to-emerald-500",
      onClick: () => {
        onToggleVisibilityClick();
        onClose();
      },
      show: isAccepted,
      disabled: isTogglingVisibility,
    },
    {
      id: "cancel",
      icon: XCircle,
      title: "Cancelar Publicación",
      description: "Cerrar permanentemente esta publicación",
      color: "from-red-500 to-rose-600",
      onClick: () => {
        onCancelClick();
        onClose();
      },
      show: true,
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Acciones de Publicación
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            ¿Qué deseas hacer con esta publicación?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                disabled={item.disabled}
                className="w-full group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl transition-all hover:shadow-md disabled:hover:border-slate-200 disabled:hover:shadow-none">
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
  );
}
