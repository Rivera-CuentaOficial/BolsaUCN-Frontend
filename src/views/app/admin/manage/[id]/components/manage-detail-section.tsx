"use client";
import React from "react";
import { formatDate, thousandSeparatorPipe } from "@/lib";
import { PublicationDetailsForAdmin } from "@/models/responses";
import { Mail, Phone, MapPin, Calendar, DollarSign, Briefcase, FileText, ShoppingCart, Eye, EyeOff } from "lucide-react";

function formatPrice(clp: number | undefined | null): string {
  if (clp === undefined || clp === null) return "No disponible";
  return `$${thousandSeparatorPipe(clp)} CLP`;
}

interface ManageDetailSectionProps {
  detail: PublicationDetailsForAdmin;
}

export function ManageDetailSection({
  detail,
}: ManageDetailSectionProps) {
  const isJobOffer = detail.publicationType !== "CompraVenta";

  return (
    <div className="space-y-6">
      {/* DESCRIPCIÓN */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
              Descripción
            </h3>
            <p className="text-xs text-gray-600">
              Información detallada de la publicación
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
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                Publicado
              </span>
            </dd>
          </div>

          {/* Visibilidad (BuySell only) */}
          {!isJobOffer && detail.availability && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Visibilidad
              </dt>
              <dd className="text-sm font-medium">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${detail.availability === "Disponible"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
                  }`}>
                  {detail.availability === "Disponible" ? (
                    <><Eye className="w-3 h-3" /> Visible</>
                  ) : (
                    <><EyeOff className="w-3 h-3" /> Oculta</>
                  )}
                </span>
              </dd>
            </div>
          )}

          {/* Fecha Límite (Job Offers) */}
          {isJobOffer && detail.deadlineDate && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Cierre de Postulaciones
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(detail.deadlineDate)}
              </dd>
            </div>
          )}

          {/* Fecha de Término (Job Offers) */}
          {isJobOffer && detail.endDate && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Fecha de Término
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(detail.endDate)}
              </dd>
            </div>
          )}

          {/* Ubicación */}
          {detail.location && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Ubicación
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {detail.location}
              </dd>
            </div>
          )}

          {/* Categoría (BuySell) */}
          {!isJobOffer && detail.category && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                Categoría
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {detail.category}
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

          {/* CV Requerido (Job Offers) */}
          {isJobOffer && detail.isCVRequired === true && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                ¿Requiere CV?
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {detail.isCVRequired ? "Sí" : "No"}
              </dd>
            </div>
          )}
        </div>
      </section>

      {/* INFORMACIÓN DE CONTACTO */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
              Información de Contacto
            </h3>
            <p className="text-xs text-gray-600">
              {isJobOffer
                ? "Datos de contacto del publicador"
                : "Datos de contacto seleccionados para esta publicación"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* For Offers: Always show all contact info */}
          {isJobOffer && (
            <>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email de Perfil
                </dt>
                <dd>
                  <a
                    href={`mailto:${detail.userEmail}`}
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline break-all"
                  >
                    {detail.userEmail}
                  </a>
                </dd>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Teléfono de Perfil
                </dt>
                <dd>
                  <a
                    href={`tel:${detail.userPhoneNumber}`}
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    {detail.userPhoneNumber}
                  </a>
                </dd>
              </div>
            </>
          )}

          {/* For BuySell: Only show selected contact info */}
          {!isJobOffer && (
            <>
              {detail.showEmail && (
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email de Contacto
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${detail.additionalContactEmail || detail.userEmail}`}
                      className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline break-all"
                    >
                      {detail.additionalContactEmail || detail.userEmail}
                    </a>
                  </dd>
                  {detail.additionalContactEmail && (
                    <p className="text-xs text-gray-500 mt-1">(Email alternativo)</p>
                  )}
                </div>
              )}

              {detail.showPhoneNumber && (
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Teléfono de Contacto
                  </dt>
                  <dd>
                    <a
                      href={`tel:${detail.additionalContactPhoneNumber || detail.userPhoneNumber}`}
                      className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      {detail.additionalContactPhoneNumber || detail.userPhoneNumber}
                    </a>
                  </dd>
                  {detail.additionalContactPhoneNumber && (
                    <p className="text-xs text-gray-500 mt-1">(Teléfono alternativo)</p>
                  )}
                </div>
              )}

              {/* Show message if no contact info is selected */}
              {!detail.showEmail && !detail.showPhoneNumber && (
                <div className="col-span-full bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-800 font-medium">
                    El publicante no ha compartido información de contacto para esta publicación.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}