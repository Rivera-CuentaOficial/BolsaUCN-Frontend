"use client";

import React from "react";
import { Star, Mail, User, ExternalLink } from "lucide-react";
import { PublicationDetailsForApprovalDTO, UseAdminDetailValidateResult } from "@/models/responses";
import Link from "next/link";

interface ValidationActionSectionProps {
  detail: PublicationDetailsForApprovalDTO;
  isMutating: UseAdminDetailValidateResult["isMutating"];
  handleAction: UseAdminDetailValidateResult["handleAction"];
}

export function ValidationActionSection({
  detail,
}: ValidationActionSectionProps) {
  const rating = (detail as any).rating || 0;
  const userId = detail.userId;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-purple-100 flex-shrink-0">
          <User className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
            Perfil del Publicador
          </h3>
          <p className="text-xs text-gray-600">
            Información del usuario que creó esta publicación
          </p>
        </div>
      </div>

      {/* PERFIL */}
      <div className="flex flex-col items-center text-center space-y-3">
        {/* AVATAR */}
        <Link 
          href={`/admin/users/${userId}`}
          className="group relative"
        >
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-3xl font-bold flex-shrink-0 group-hover:bg-purple-200 transition-colors">
            {detail.companyName ? detail.companyName[0].toUpperCase() : "U"}
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <ExternalLink className="w-3 h-3 text-white" />
          </div>
        </Link>

        {/* NOMBRE */}
        <Link 
          href={`/admin/users/${userId}`}
          className="font-bold text-lg text-gray-900 break-words w-full px-2 leading-tight hover:text-purple-600 transition-colors"
        >
          {detail.companyName || "Usuario UCN"}
        </Link>

        {/* RATING */}
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Star
              key={index}
              size={18}
              className={`${
                index <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              } flex-shrink-0`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1 font-medium">
            ({rating})
          </span>
        </div>
      </div>

      {/* INFO DETALLADA */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        {/* INFORMACIÓN DE CONTACTO */}
        {detail.userEmail && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Contacto Institucional
            </dt>
            <dd className="text-sm font-medium text-gray-900 break-all">
              {detail.userEmail}
            </dd>
          </div>
        )}

        {/* DESCRIPCION */}
        {detail.aboutMe && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Acerca de
            </dt>
            <dd className="text-sm text-gray-700 leading-relaxed break-words">
              {detail.aboutMe}
            </dd>
          </div>
        )}
      </div>

      {/* VIEW PROFILE BUTTON */}
      <Link
        href={`/admin/users/${userId}`}
        className="w-full px-4 py-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl font-bold hover:bg-purple-100 transition flex justify-center items-center gap-2 text-sm"
      >
        <User className="w-4 h-4" />
        Ver Perfil Completo
      </Link>
    </div>
  );
}