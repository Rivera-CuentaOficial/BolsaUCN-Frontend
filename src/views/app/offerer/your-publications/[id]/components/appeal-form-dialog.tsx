// frontend/src/views/app/offerer/your-publications/[id]/components/appeal-form-dialog.tsx
"use client";

import React, { useEffect } from "react";
import { X, AlertCircle, Mail, Phone, Calendar, DollarSign, Briefcase, MapPin, ClipboardList, FileText } from "lucide-react";
import { useAppealForm } from "../hooks/use-appeal-form";
import type { MyPublicationDetails } from "src/models/responses";

interface AppealFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  publication: MyPublicationDetails | null;
  onSubmit: (formData: any) => Promise<void>;
  isSubmitting: boolean;
}

export function AppealFormDialog({
  isOpen,
  onClose,
  publication,
  onSubmit,
  isSubmitting,
}: AppealFormDialogProps) {
  const { formData, errors, handleInputChange, validateForm, reset } = useAppealForm({
    publication,
  });

  useEffect(() => {
    if (isOpen && publication) {
      reset();
    }
  }, [isOpen, publication]);

  if (!isOpen || !publication) return null;

  const isOffer = publication.publicationType === "Oferta";
  const isBuySell = publication.publicationType === "CompraVenta";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Build the appeal data object based on publication type
    const appealData: any = {
      Tittle: formData.title,
      Description: formData.description,
      Location: formData.location || undefined,
      AdditionalContactEmail: formData.additionalContactEmail || undefined,
      AdditionalContactPhoneNumber: formData.additionalContactPhoneNumber || undefined,
    };

    if (isOffer) {
      appealData.EndDate = formData.endDate || undefined;
      appealData.ApplicationDeadline = formData.applicationDeadline || undefined;
      appealData.Remuneration = formData.remuneration ? parseInt(formData.remuneration, 10) : undefined;
      appealData.OfferType = formData.offerType || undefined;
      appealData.IsCvRequired = formData.isCvRequired;
      appealData.RequiredApplicants = formData.requiredApplicants ? parseInt(formData.requiredApplicants, 10) : undefined;
    }

    if (isBuySell) {
      appealData.Category = formData.category || undefined;
      appealData.Price = formData.price ? parseInt(formData.price, 10) : undefined;
      appealData.Quantity = formData.quantity ? parseInt(formData.quantity, 10) : undefined;
      appealData.Availability = formData.availability || undefined;
      appealData.Condition = formData.condition || undefined;
    }

    await onSubmit(appealData);
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl bg-gray-50 border ${
      hasError ? "border-red-500" : "border-gray-200"
    } text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white outline-none transition-all`;

  const labelClass = "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";
  const errorClass = "text-red-600 text-sm mt-1 font-medium";
  const sectionClass = "bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black">Apelar Publicación Rechazada</h2>
            <p className="text-purple-100 text-sm mt-1">
              Revisa y corrige los campos necesarios para apelar
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-white/20 rounded-full transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-1">Motivo del Rechazo:</p>
              <p className="text-blue-800 bg-blue-100 p-3 rounded-lg border border-blue-300">
                {publication.reasonForRejection || "No especificado"}
              </p>
              <p className="mt-3 font-semibold">
                Edita los campos necesarios según el motivo del rechazo. Solo se enviarán los campos que modifiques.
              </p>
            </div>
          </div>

          {/* Common Fields - Información Básica */}
          <div className={sectionClass}>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-100">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Información Básica
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Proporciona los detalles principales de tu publicación
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="title" className={labelClass}>
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={inputClass(!!errors.title)}
                placeholder={isOffer ? "Ej: Se busca Ayudante" : "Ej: Vendo Libro de Cálculo"}
              />
              {errors.title && <p className={errorClass}>{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Descripción {isOffer && "y Requisitos"} *
              </label>
              <p className="text-xs text-gray-600 mb-2">
                {isOffer 
                  ? "Describe el trabajo y los requisitos. Puedes estructurarlo de forma clara."
                  : "Describe el artículo en detalle: estado, características, motivo de venta, etc."}
              </p>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={isOffer ? 8 : 6}
                className={inputClass(!!errors.description) + " resize-none"}
                placeholder={
                  isOffer 
                    ? "Descripción del Trabajo:\nBuscamos un ayudante para apoyar en...\n\nRequisitos:\n• Conocimientos en...\n• Experiencia con...\n• Disponibilidad de..."
                    : "Ej: Vendo libro de Cálculo I en excelente estado. Apenas usado, sin marcas ni rayones..."
                }
              />
              {errors.description && <p className={errorClass}>{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="location" className={labelClass}>
                Ubicación {isOffer && "*"}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={inputClass(!!errors.location)}
                placeholder="Ej: Antofagasta, Chile"
              />
              {errors.location && <p className={errorClass}>{errors.location}</p>}
            </div>
          </div>

          {/* Offer-Specific Fields */}
          {isOffer && (
            <>
              {/* Tipo de Trabajo */}
              <div className={sectionClass}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-100">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Tipo de Trabajo *</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "Trabajo", label: "Trabajo" },
                    { id: "Voluntariado", label: "Voluntariado" },
                  ].map((type) => (
                    <label
                      key={type.id}
                      className={`
                        cursor-pointer rounded-xl border p-4 text-center transition-all
                        ${
                          formData.offerType === type.id
                            ? "bg-purple-600 text-white border-purple-600 font-bold shadow-lg"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="offerType"
                        value={type.id}
                        checked={formData.offerType === type.id}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
                {errors.offerType && <p className={errorClass}>{errors.offerType}</p>}
              </div>

              {/* Fechas */}
              <div className={sectionClass}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-100">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Fechas Importantes
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Define los plazos de tu oferta
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="applicationDeadline" className={labelClass}>
                      Cierre de Postulaciones *
                    </label>
                    <input
                      type="date"
                      id="applicationDeadline"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleInputChange}
                      className={inputClass(!!errors.applicationDeadline)}
                    />
                    {errors.applicationDeadline && (
                      <p className={errorClass}>{errors.applicationDeadline}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endDate" className={labelClass}>
                      Fecha de Término *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={inputClass(!!errors.endDate)}
                    />
                    {errors.endDate && <p className={errorClass}>{errors.endDate}</p>}
                  </div>
                </div>
              </div>

              {/* Remuneración */}
              <div className={sectionClass}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-100">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Remuneración
                    </h3>
                  </div>
                </div>

                <div>
                  <label htmlFor="remuneration" className={labelClass}>
                    Remuneración (CLP) {formData.offerType === "Trabajo" && "*"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      id="remuneration"
                      name="remuneration"
                      value={formData.offerType === "Voluntariado" ? "" : formData.remuneration}
                      onChange={handleInputChange}
                      className={inputClass(!!errors.remuneration) + " pl-8"}
                      placeholder={formData.offerType === "Voluntariado" ? "No aplica" : "0"}
                      disabled={formData.offerType === "Voluntariado"}
                      min={formData.offerType === "Trabajo" ? "1" : "0"}
                    />
                  </div>
                  {formData.offerType === "Voluntariado" && (
                    <p className="text-yellow-600 text-xs mt-2 font-medium">
                      Un voluntariado no tiene remuneración
                    </p>
                  )}
                  {errors.remuneration && <p className={errorClass}>{errors.remuneration}</p>}
                </div>
              </div>

              {/* Número de Postulantes */}
              <div className={sectionClass}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-100">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Postulantes Requeridos
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Indica cuántas personas necesitas contratar
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="requiredApplicants" className={labelClass}>
                    Número de Postulantes *
                  </label>
                  <input
                    type="number"
                    id="requiredApplicants"
                    name="requiredApplicants"
                    value={formData.requiredApplicants}
                    onChange={handleInputChange}
                    className={inputClass(!!errors.requiredApplicants)}
                    placeholder="1"
                    min="1"
                    max="50"
                  />
                  {errors.requiredApplicants && (
                    <p className={errorClass}>{errors.requiredApplicants}</p>
                  )}
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-900 leading-relaxed">
                      💡 <span className="font-semibold">Tip:</span> Indica cuántas vacantes hay disponibles (1-50).
                    </p>
                  </div>
                </div>
              </div>

              {/* CV Requerido */}
              <div className={sectionClass}>
                <div className="flex items-center gap-3">
                  <input
                    id="isCvRequired"
                    name="isCvRequired"
                    type="checkbox"
                    checked={formData.isCvRequired}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <label
                    htmlFor="isCvRequired"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    ¿Requiere enviar CV para postular?
                  </label>
                </div>
              </div>
            </>
          )}

          {/* BuySell-Specific Fields */}
          {isBuySell && (
            <div className={sectionClass}>
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-100">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Detalles del Artículo
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Categoría *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={inputClass(!!errors.category)}
                  >
                    <option value="">Selecciona...</option>
                    <option value="Libros Universitarios">Libros Universitarios</option>
                    <option value="Materiales">Materiales / Insumos</option>
                    <option value="Tutorías">Tutorías</option>
                    <option value="Otros">Otros</option>
                  </select>
                  {errors.category && <p className={errorClass}>{errors.category}</p>}
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className={labelClass}>
                    Precio (CLP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={inputClass(!!errors.price) + " pl-8"}
                      placeholder="1000"
                    />
                  </div>
                  {errors.price && <p className={errorClass}>{errors.price}</p>}
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className={labelClass}>
                    Cantidad
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className={inputClass(!!errors.quantity)}
                    placeholder="1"
                    min="1"
                  />
                  {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
                </div>

                {/* Availability */}
                <div>
                  <label htmlFor="availability" className={labelClass}>
                    Disponibilidad
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className={inputClass(!!errors.availability)}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                  {errors.availability && <p className={errorClass}>{errors.availability}</p>}
                </div>

                {/* Condition */}
                <div className="md:col-span-2">
                  <label htmlFor="condition" className={labelClass}>
                    Condición
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className={inputClass(!!errors.condition)}
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="ComoNuevo">Como Nuevo</option>
                    <option value="Usado">Usado</option>
                    <option value="NoAplica">No Aplica</option>
                  </select>
                  {errors.condition && <p className={errorClass}>{errors.condition}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Contact Information - Common to both */}
          <div className={sectionClass}>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-100">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Información de Contacto Adicional
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Opcional: Datos de contacto alternativos
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="additionalContactEmail" className={labelClass}>
                Email Adicional <span className="text-xs font-normal text-gray-500">(Opcional)</span>
              </label>
              <input
                type="email"
                id="additionalContactEmail"
                name="additionalContactEmail"
                value={formData.additionalContactEmail}
                onChange={handleInputChange}
                className={inputClass(!!errors.additionalContactEmail)}
                placeholder="correo@ejemplo.com"
              />
              {errors.additionalContactEmail && (
                <p className={errorClass}>{errors.additionalContactEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="additionalContactPhoneNumber" className={labelClass}>
                Teléfono Adicional <span className="text-xs font-normal text-gray-500">(Opcional)</span>
              </label>
              <input
                type="tel"
                id="additionalContactPhoneNumber"
                name="additionalContactPhoneNumber"
                value={formData.additionalContactPhoneNumber}
                onChange={handleInputChange}
                className={inputClass(!!errors.additionalContactPhoneNumber)}
                placeholder="+56 9 1234 5678"
              />
              {errors.additionalContactPhoneNumber && (
                <p className={errorClass}>{errors.additionalContactPhoneNumber}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 rounded-xl font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:from-purple-300 disabled:to-fuchsia-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </span>
              ) : (
                "Enviar Apelación"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}