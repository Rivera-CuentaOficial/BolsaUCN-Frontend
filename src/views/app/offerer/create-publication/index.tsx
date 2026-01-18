"use client";
import { useEffect } from "react";
import LoadingSpinner from "../components/loading-spinner";
import { useRouter } from "next/navigation";
import { usePublicationForm } from "../hooks/usePublicationForm";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Briefcase,
} from "lucide-react";
import { NotificationBanner } from "@/components/ui/notification";

/**
 * Vista principal para crear una nueva publicación.
 * Renderiza un formulario dinámico que cambia sus campos según si el usuario selecciona
 * "Oferta Laboral" o "Venta de Artículo".
 */
export default function PublicationFormView() {
  const router = useRouter();
  const {
    formData,
    errors,
    isLoading,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    notification,
    isVisible,
    closeNotification,
  } = usePublicationForm();

  // Flags para renderizado condicional de secciones del formulario
  const isJobOffer = formData.type === "0";
  const isProduct = formData.type === "1";

  // Efecto para asegurar que "Voluntariado" esté seleccionado visualmente por defecto
  useEffect(() => {
    if (isJobOffer && !formData.offerType) {
      handleInputChange({
        target: { name: "offerType", value: "JobOffer" },
      } as any);
    }
  }, [isJobOffer, formData.offerType, handleInputChange]);

  if (isLoading) return <LoadingSpinner />;

  // Clases reutilizables para mantener consistencia en el diseño dark/glass
  const inputClass = (hasError: boolean) => `
    w-full px-4 py-3 rounded-xl 
    bg-gray-50 border ${hasError ? "border-red-500" : "border-gray-200"} 
    text-gray-900 placeholder:text-gray-400 
    focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white
    outline-none transition-all
  `;

  const labelClass =
    "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-slate-900">
      {/* Background Layers (Igual que ValidationView) */}
      <div className="fixed inset-0 z-0">
        <img
          src="/fondo.png"
          alt="Fondo UCN"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90" />
      </div>

      <NotificationBanner
        data={notification}
        isVisible={isVisible}
        onClose={closeNotification}
      />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header */}
        <header className="mb-10 max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <div className="flex flex-col items-start gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg transform -rotate-1">
              <Sparkles className="w-3.5 h-3.5" /> Nueva Publicación
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight mt-2">
              Crear <br className="md:hidden" /> Oportunidad
            </h1>
            <p className="text-purple-100 text-lg font-medium mt-3 drop-shadow-md">
              Comparte una oferta laboral o vende un artículo a la comunidad.
            </p>
          </div>
        </header>

        {/* Form Container (Glassmorphism) */}
        <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] border border-gray-200 p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- SELECTOR DE TIPO DE PUBLICACIÓN --- */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <label className={labelClass}>Tipo de Publicación *</label>
              <div className="relative">
                <select
                  name="offerType"
                  value={formData.offerType}
                  onChange={handleInputChange}
                  className={
                    inputClass(false) + " appearance-none cursor-pointer"
                  }
                >
                  <option value="0" className="text-gray-900 bg-white">
                    Oferta Laboral / Práctica
                  </option>
                  <option value="1" className="text-gray-900 bg-white">
                    Venta de Artículo / Libro
                  </option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Briefcase size={20} />
                </div>
              </div>
            </div>

            {/* --- CAMPOS COMUNES --- */}
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Título *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={inputClass(!!errors.title)}
                  placeholder={
                    isJobOffer ? "Ej: Se busca Ayudante" : "Ej: Vendo Libro"
                  }
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Descripción *</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={inputClass(!!errors.description) + " resize-none"}
                  placeholder="Describe los detalles..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
            {/* --- SECCIÓN COMÚN: CONTACTO --- */}
            <div>
              <label className={labelClass}>Información de Contacto *</label>
              <div className="relative">
                <input
                  type="text"
                  name="additionalContactInfo"
                  value={formData.additionalContactInfo}
                  onChange={handleInputChange}
                  className={inputClass(!!errors.additionalContactInfo)}
                  placeholder="Ej: correo@ucn.cl"
                />
                <Mail
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
              {errors.additionalContactInfo && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors.additionalContactInfo}
                </p>
              )}
            </div>
            {/* --- SECCIÓN ESPECÍFICA: VENTA (TIPO 2) --- */}
            {isProduct && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Categoría *</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={
                          inputClass(!!errors.category) + " appearance-none"
                        }
                      >
                        <option value="" className="text-gray-900 bg-white">
                          Selecciona...
                        </option>
                        <option
                          value="Libros Universitarios"
                          className="text-gray-900 bg-white"
                        >
                          Libros Universitarios
                        </option>
                        <option
                          value="Materiales"
                          className="text-gray-900 bg-white"
                        >
                          Materiales / Insumos
                        </option>
                        <option
                          value="Tutorías"
                          className="text-gray-900 bg-white"
                        >
                          Tutorías
                        </option>
                        <option
                          value="Otros"
                          className="text-gray-900 bg-white"
                        >
                          Otros
                        </option>
                      </select>
                      <BookOpen
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Precio (CLP) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={inputClass(!!errors.price) + " pl-8"}
                        placeholder="1000"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- SECCIÓN ESPECÍFICA: OFERTA LABORAL (TIPO 1) --- */}
            {isJobOffer && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <label className={labelClass}>Tipo de Trabajo *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "JobOffer", label: "Trabajo" },
                      { id: "Volunteering", label: "Voluntariado" },
                    ].map((type) => (
                      <label
                        key={type.id}
                        className={`
                                    cursor-pointer rounded-xl border p-3 text-center transition-all
                                    ${
                                      formData.offerType === type.id
                                        ? "bg-purple-600 text-white border-purple-600 font-bold shadow-lg scale-105"
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
                  {errors.offerType && (
                    <p className="text-red-500 text-xs mt-2 font-medium">
                      {errors.offerType}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Cierre Postulaciones *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="applicationDeadline"
                        value={formData.applicationDeadline}
                        onChange={handleInputChange}
                        className={inputClass(!!errors.applicationDeadline)}
                      />
                      <Calendar
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                    {errors.applicationDeadline && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {errors.applicationDeadline}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Fecha de Término *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={inputClass(!!errors.endDate)}
                      />
                      <Clock
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                    {errors.endDate && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Remuneración</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        name="remuneration"
                        value={formData.remuneration}
                        onChange={handleInputChange}
                        className={inputClass(!!errors.remuneration) + " pl-8"}
                        placeholder="0.00"
                        disabled={formData.offerType === "Volunteering"}
                        min={formData.offerType === "JobOffer" ? "1" : "0"}
                      />
                    </div>
                    {formData.offerType === "Volunteering" && (
                      <p className="text-yellow-600 text-xs mt-2 font-medium">
                        * Un voluntariado no puede tener remuneración
                      </p>
                    )}
                    {errors.remuneration && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {errors.remuneration}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Ubicación *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={inputClass(!!errors.location)}
                        placeholder="Ej: Coquimbo"
                      />
                      <MapPin
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Requisitos</label>
                  <textarea
                    name="requirements"
                    rows={3}
                    value={formData.requirements}
                    onChange={handleInputChange}
                    className={inputClass(false) + " resize-none"}
                  />
                </div>

                <div className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <input
                    id="isCvRequired"
                    name="isCvRequired"
                    type="checkbox"
                    checked={formData.isCvRequired}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-purple-600 rounded border-gray-300 bg-white focus:ring-purple-500"
                  />
                  <label
                    htmlFor="isCvRequired"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    ¿Requiere enviar CV?
                  </label>
                </div>
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed font-black text-lg py-4 rounded-xl shadow-xl shadow-purple-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting
                ? "Enviando..."
                : isProduct
                ? "PUBLICAR VENTA"
                : "PUBLICAR OFERTA"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
