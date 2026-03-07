"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit2, Eye, EyeOff, XCircle, ChevronRight, ArrowRight, Users } from "lucide-react";
import type { MyPublicationDetails } from "@/models/responses";

interface OfferActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  publication: MyPublicationDetails;
  canAdvance: boolean;
  canCancel: boolean;
  isMutating: boolean;
  setIsApplicantsDialogOpen: (open: boolean) => void;
  setIsAdvanceDialogOpen: (open: boolean) => void;
  setIsCancelDialogOpen: (open: boolean) => void;
  setIsOfferActionsMenuOpen: (open: boolean) => void;
}

export function OfferActionsMenu({
  isOpen,
  onClose,
  publication,
  canAdvance,
  canCancel,
  isMutating,
  setIsApplicantsDialogOpen,
  setIsAdvanceDialogOpen,
  setIsCancelDialogOpen,
  setIsOfferActionsMenuOpen,
}: OfferActionsMenuProps) {

  const offerMenuItems = [
  {
    id: "applicants",
    icon: Users,
    title: `Postulantes (${publication.applicationsCount || 0})`,
    description: "Ver y gestionar los postulantes a esta oferta",
    color: "from-indigo-500 to-blue-500",
    onClick: () => { setIsApplicantsDialogOpen(true); setIsOfferActionsMenuOpen(false); },
    show: true,
  },
  {
    id: "advance",
    icon: ArrowRight,
    title: "Avanzar Estado",
    description: canAdvance && publication.offerStatus === 'RecibiendoPostulaciones'
      ? "Cerrar postulaciones e iniciar el trabajo"
      : "Marcar el trabajo como completado",
    color: "from-blue-500 to-cyan-500",
    onClick: () => { setIsAdvanceDialogOpen(true); setIsOfferActionsMenuOpen(false); },
    show: canAdvance,
    disabled: isMutating,
  },
  {
    id: "cancel",
    icon: XCircle,
    title: "Cancelar Oferta",
    description: "Cancelar permanentemente esta oferta",
    color: "from-red-500 to-rose-600",
    onClick: () => { setIsCancelDialogOpen(true); setIsOfferActionsMenuOpen(false); },
    show: canCancel,
  },
];

  const visibleItems = offerMenuItems.filter(item => item.show);

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
