"use client";

import React from "react";
import { Star, User as UserIcon } from "lucide-react";
import { PublicationDetailsForAdmin } from "@/models/responses";

interface ManageProfileSectionProps {
  detail: PublicationDetailsForAdmin;
}

export function ManageProfileSection({ detail }: ManageProfileSectionProps) {
  const rating = detail.rating || 0; 
  const userName = detail.userName || "Usuario UCN";
  const userInitial = userName[0]?.toUpperCase() || "U";

  return (
    <div className="space-y-6">
      {/* Perfil del Usuario */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-100">
            <UserIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
              Información del Publicador
            </h3>
            <p className="text-xs text-gray-600">
              Usuario autor de la publicación
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 bg-white p-5 rounded-xl border border-slate-200">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {userInitial}
          </div>

          {/* Nombre */}
          <div className="flex flex-col items-center">
            <p className="font-bold text-lg text-gray-900 break-words px-2">
              {userName}
            </p>

            {/* Rating */}
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Star
                  key={index}
                  size={16}
                  className={`${
                    index <= rating 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-2 font-medium">
                ({rating.toFixed(1)}/6)
              </span>
            </div>
          </div>

          {/* Contact Info */}
          {detail.userEmail && (
            <div className="w-full pt-4 border-t border-slate-200">
              <div className="text-left space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contacto:
                </span>
                <p className="text-sm text-gray-900 break-all">
                  {detail.userEmail}
                </p>
              </div>
            </div>
          )}
          
          {/* About Me */}
          {detail.aboutMe && (
            <div className="w-full pt-4 border-t border-slate-200">
              <div className="text-left space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Acerca de:
                </span>
                <p className="text-sm text-gray-700 break-words leading-relaxed">
                  {detail.aboutMe}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Imágenes (placeholder for now - right beneath user info) */}
      {detail.images && detail.images.length > 0 && (
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-100">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                Imágenes
              </h3>
              <p className="text-xs text-gray-600">
                Galería de la publicación
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {detail.images.map((imageUrl, index) => (
              <div 
                key={index} 
                className="relative aspect-square rounded-xl overflow-hidden bg-white border-2 border-slate-200 hover:border-purple-300 transition-colors"
              >
                <img
                  src={imageUrl}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo_feucn_extendido.png";
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Placeholder if no images */}
      {(!detail.images || detail.images.length === 0) && (
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-slate-200">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                Imágenes
              </h3>
              <p className="text-xs text-gray-600">
                Sin imágenes disponibles
              </p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              No hay imágenes en esta publicación
            </p>
          </div>
        </section>
      )}
    </div>
  );
}