"use client";
import React from "react";
import { formatDate, thousandSeparatorPipe } from "@/lib";
import { PublicationDetailsForApprovalDTO } from "@/models/responses";
import { Mail, Phone, MapPin, Calendar, DollarSign, Briefcase, FileText, Tag } from "lucide-react";

function formatPrice(clp: number | undefined | null): string {
  if (clp === undefined || clp === null) return "No disponible";
  return `$${thousandSeparatorPipe(clp)} CLP`;
}

interface ValidationDetailSectionProps {
  detail: PublicationDetailsForApprovalDTO;
}

export function ValidationDetailSection({
  detail,
}: ValidationDetailSectionProps) {
  const isJobOffer = detail.publicationType !== "CompraVenta";

  return (
    <div className="space-y-6">
      {/* Imagen */}
      {detail.imageUrls && detail.imageUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Imágenes del Producto</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {detail.imageUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-48 object-cover rounded-xl border-2 border-slate-200 hover:border-purple-400 transition"
              />
            ))}
          </div>
        </div>
      )}

      {/* DESCRIPCIÓN Y REQUISITOS */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
              Descripción {isJobOffer && "y Requisitos"}
            </h3>
            <p className="text-xs text-gray-600">
              {isJobOffer 
                ? "Detalles del trabajo y requisitos para aplicar"
                : "Información sobre el artículo en venta"}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-gray-900 leading-relaxed whitespace-pre-line">
            {detail.description || "No hay descripción proporcionada."}
          </p>
        </div>
      </section>

      {/* INFORMACIÓN GENERAL */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100">
            <Briefcase className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
              Información General
            </h3>
            <p className="text-xs text-gray-600">
              Detalles clave de la publicación
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ID de Publicación */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              ID de Publicación
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              #{detail.publicationId}
            </dd>
          </div>
          {/* Fecha de Publicación */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Fecha de Publicación
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatDate(detail.publicationDate || "")}
            </dd>
          </div>

          {/* Estado */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Estado Validación
            </dt>
            <dd className="text-sm font-medium">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                Pendiente
              </span>
            </dd>
          </div>

          {/* Tipo de Publicación */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Tipo de Publicación
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              {detail.publicationType === "CompraVenta" ? "Compra/Venta" : "Oferta de Trabajo"}
            </dd>
          </div>

          {/* Fecha Límite (Job Offers) */}
          {isJobOffer && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Cierre de Postulaciones
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(detail.applicationDeadline || "")}
              </dd>
            </div>
          )}

          {/* Fecha de Término (Job Offers) */}
          {isJobOffer && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Fecha de Término
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(detail.endDate || "")}
              </dd>
            </div>
          )}

          {/* Ubicación */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Ubicación
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              {detail.location || "No especificada"}
            </dd>
          </div>

          {/* Categoría (BuySell) */}
          {!isJobOffer && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Categoría
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {detail.category || "No especificada"}
              </dd>
            </div>
          )}

          {/* Remuneración / Precio */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {isJobOffer ? "Remuneración" : "Precio"}
            </dt>
            <dd className="text-lg font-bold text-green-700">
              {formatPrice(
                detail.price !== undefined && detail.price !== null
                  ? detail.price
                  : detail.remuneration
              )}
            </dd>
          </div>

          {/* CV Requerido */}
          {isJobOffer && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                ¿Requiere CV?
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {detail.isCVRequired ? "Sí" : "No"}
              </dd>
            </div>
          )}

          {/* Veces que ha sido apelada */}
          {detail.numberOfAppeals > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Número de Apelaciones
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {detail.numberOfAppeals}
              </dd>
            </div>
          )}
            {/* Razón de Rechazo Anterior */}
            {detail.lastRejectionReason && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 sm:col-span-2">
              <dt className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">
                Razón de Rechazo Anterior
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {detail.lastRejectionReason}
              </dd>
            </div>
          )}
        </div>
      </section>

      {/* INFORMACIÓN DE CONTACTO ADICIONAL */}
      {(detail.additionalContactEmail || detail.additionalContactPhoneNumber) && (
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                Información de Contacto Adicional
              </h3>
              <p className="text-xs text-gray-600">
                Datos de contacto alternativos proporcionados por el publicador
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detail.additionalContactEmail && (
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email Adicional
                </dt>
                <dd>
                  <a 
                    href={`mailto:${detail.additionalContactEmail}`}
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline break-all"
                  >
                    {detail.additionalContactEmail}
                  </a>
                </dd>
              </div>
            )}

            {detail.additionalContactPhoneNumber && (
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Teléfono Adicional
                </dt>
                <dd>
                  <a 
                    href={`tel:${detail.additionalContactPhoneNumber}`}
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    {detail.additionalContactPhoneNumber}
                  </a>
                </dd>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}