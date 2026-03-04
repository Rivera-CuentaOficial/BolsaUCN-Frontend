"use client";
import { useEffect } from "react";
import LoadingSpinner from "./components/loading-spinner";
import { useRouter } from "next/navigation";
import { usePublicationForm } from "./hooks/use-publication-form";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Briefcase,
  DollarSign,
  FileText,
  Phone,
  CheckCircle2,
  ClipboardList,
  Package,
  Info,
  Tag,
  Image as ImageIcon,
  X,
  Upload,
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
    handlePhoneChange,
    formatPhoneDisplay,
    handleImageChange,
    handleRemoveImage,
    handleClearImages,
    handleSubmit,
    notification,
    isVisible,
    closeNotification,
  } = usePublicationForm();

  // Flags para renderizado condicional de secciones del formulario
  const isJobOffer = formData.type === "0";
  const isProduct = formData.type === "1";
  const hasSelectedType = formData.type !== "";

  // Efecto para asegurar que "Voluntariado" esté seleccionado visualmente por defecto
  useEffect(() => {
    if (isJobOffer && !formData.offerType) {
      handleInputChange({
        target: { name: "offerType", value: "JobOffer" },
      } as any);
    }
  }, [isJobOffer, formData.offerType, handleInputChange]);

  if (isLoading) return <LoadingSpinner />;

  // Clases reutilizables para mantener consistencia en el diseño
  const inputClass = (hasError: boolean) => `
    w-full px-4 py-3 rounded-xl 
    bg-gray-50 border ${hasError ? "border-red-500" : "border-gray-200"} 
    text-gray-900 placeholder:text-gray-400 
    focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white
    outline-none transition-all
  `;

  const labelClass =
    "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";

  const sectionClass = "bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-5";

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">

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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg transform">
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

        {/* Form Container */}
        <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] border border-gray-200 p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- SELECTOR DE TIPO DE PUBLICACIÓN --- */}
            {!hasSelectedType ? (
              // Initial Large Card Selection (Option 1)
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">
                    ¿Qué deseas publicar?
                  </h2>
                  <p className="text-sm text-gray-600">
                    Selecciona el tipo de publicación para comenzar
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Oferta Laboral Card */}
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: "type", value: "0" } } as any)}
                    className="group relative overflow-hidden p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    <div className="relative z-10 text-center">
                      <div className="inline-flex p-4 rounded-2xl mb-4 bg-gray-100 group-hover:bg-purple-100 transition-colors">
                        <Briefcase className="w-8 h-8 text-gray-600 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        Oferta Laboral
                      </h3>
                      <p className="text-sm text-gray-600">
                        Trabajo remunerado o voluntariado
                      </p>
                    </div>
                  </button>

                  {/* Venta de Artículo Card */}
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: "type", value: "1" } } as any)}
                    className="group relative overflow-hidden p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    <div className="relative z-10 text-center">
                      <div className="inline-flex p-4 rounded-2xl mb-4 bg-gray-100 group-hover:bg-purple-100 transition-colors">
                        <DollarSign className="w-8 h-8 text-gray-600 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        Venta de Artículo
                      </h3>
                      <p className="text-sm text-gray-600">
                        Libros, materiales u otros artículos
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              // Compact Segmented Control (Option 2) - Shown after selection
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">
                  Tipo de Publicación
                </label>
                <div className="bg-gray-100 p-1.5 rounded-2xl flex">
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: "type", value: "0" } } as any)}
                    className={`
                      flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all
                      ${formData.type === "0"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>Oferta Laboral</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: "type", value: "1" } } as any)}
                    className={`
                      flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all
                      ${formData.type === "1"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Venta de Artículo</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Rest of form only shows after type selection */}
            {hasSelectedType && (
              <>
                {/* --- INFORMACIÓN BÁSICA --- */}
                <div className={sectionClass + " animate-in fade-in slide-in-from-bottom-4 duration-500"}>
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
                      <label className={labelClass}>
                        Descripción {isJobOffer && "y Requisitos"} *
                      </label>
                      <p className="text-xs text-gray-600 mb-2">
                        {isJobOffer 
                          ? "Describe el trabajo y los requisitos. Puedes estructurarlo usando el ejemplo a continuación."
                          : "Describe el artículo en detalle: estado, características, motivo de venta, etc."}
                      </p>
                      <textarea
                        name="description"
                        rows={isJobOffer ? 8 : 5}
                        value={formData.description}
                        onChange={handleInputChange}
                        className={inputClass(!!errors.description) + " resize-none"}
                        placeholder={
                          isJobOffer 
                            ? `Descripción del Trabajo:\nBuscamos un ayudante para apoyar en...\n\nRequisitos:\n• Conocimientos en...\n• Experiencia con...\n• Disponibilidad de...\n\n`
                            : "Ej: Vendo libro de Cálculo I en excelente estado. Apenas usado, sin marcas ni rayones. Lo vendo porque ya aprobé el ramo..."
                        }
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                          {errors.description}
                        </p>
                      )}
                      {isJobOffer && (
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-900 leading-relaxed">
                            💡 <span className="font-semibold">Tip:</span> Usa el formato sugerido arriba para estructurar tu publicación. Incluye descripción del trabajo, requisitos y responsabilidades.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- INFORMACIÓN DE CONTACTO --- */}
                <div className={sectionClass}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-purple-100">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Información de Contacto {isProduct && <span className="text-red-600">*</span>}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {isJobOffer
                          ? "Tu email y teléfono institucional se mostrarán automáticamente. Puedes agregar contactos adicionales."
                          : "Selecciona qué tipo de contacto deseas mostrar (al menos uno). Por defecto se usa la información de tu perfil."}
                      </p>
                    </div>
                  </div>

                  {/* Opciones de contacto para BuySell */}
                  {isProduct && (
                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        ¿Qué información de contacto deseas mostrar?
                      </p>

                      {/* Opción 1: Email */}
                      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:border-purple-300">
                        <div className="flex items-start p-4 gap-3 border-b border-gray-100">
                          <input
                            id="showProfileEmail"
                            name="showProfileEmail"
                            type="checkbox"
                            checked={formData.showProfileEmail}
                            onChange={handleInputChange}
                            className="mt-0.5 h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 flex-shrink-0"
                          />
                          <label htmlFor="showProfileEmail" className="flex-1 cursor-pointer">
                            <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                              <Mail className="w-4 h-4 text-purple-600" />
                              ¿Deseas mostrar un email de contacto?
                            </span>
                          </label>
                        </div>

                        {formData.showProfileEmail && (
                          <div className="p-4 bg-gray-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs text-blue-900 leading-relaxed">
                                <span className="font-semibold">Por defecto:</span> Se mostrará tu <span className="font-semibold">email institucional</span> registrado en tu perfil.
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                Email Alternativo <span className="text-gray-500 font-normal">(Opcional)</span>
                              </label>
                              <p className="text-xs text-gray-600 mb-2">
                                Si prefieres no usar tu email institucional, proporciona uno personal aquí:
                              </p>
                              <input
                                type="email"
                                name="additionalContactEmail"
                                value={formData.additionalContactEmail}
                                onChange={handleInputChange}
                                className={inputClass(!!errors.additionalContactEmail)}
                                placeholder="tu.email@gmail.com"
                              />
                              <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                                <p className="text-xs text-purple-800 leading-relaxed">
                                  ℹ️ <span className="font-semibold">Importante:</span> Esta información no se guarda en tu perfil. Asegúrate de usar un email válido.
                                </p>
                              </div>
                              {errors.additionalContactEmail && (
                                <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                                  <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                                  {errors.additionalContactEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Opción 2: Teléfono */}
                      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:border-purple-300">
                        <div className="flex items-start p-4 gap-3 border-b border-gray-100">
                          <input
                            id="showProfilePhone"
                            name="showProfilePhone"
                            type="checkbox"
                            checked={formData.showProfilePhone}
                            onChange={handleInputChange}
                            className="mt-0.5 h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 flex-shrink-0"
                          />
                          <label htmlFor="showProfilePhone" className="flex-1 cursor-pointer">
                            <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                              <Phone className="w-4 h-4 text-purple-600" />
                              ¿Deseas mostrar un teléfono de contacto?
                            </span>
                          </label>
                        </div>

                        {formData.showProfilePhone && (
                          <div className="p-4 bg-gray-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs text-blue-900 leading-relaxed">
                                <span className="font-semibold">Por defecto:</span> Se mostrará tu <span className="font-semibold">teléfono institucional</span> registrado en tu perfil.
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                Teléfono Alternativo <span className="text-gray-500 font-normal">(Opcional)</span>
                              </label>
                              <p className="text-xs text-gray-600 mb-2">
                                Si prefieres no usar tu teléfono guardado en tu perfil, proporciona uno alternativo aquí:
                              </p>
                              <div className="relative">
                                <input
                                  type="tel"
                                  name="additionalContactPhoneNumber"
                                  value={formatPhoneDisplay(formData.additionalContactPhoneNumber)}
                                  onChange={handlePhoneChange}
                                  className={`${inputClass(!!errors.additionalContactPhoneNumber)} pl-20`}
                                  placeholder="9 1234 5678"
                                  maxLength={11}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 pointer-events-none z-10">
                                  <Phone size={14} />
                                  <span className="text-sm font-semibold">+56</span>
                                </div>
                              </div>
                              <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                                <p className="text-xs text-purple-800 leading-relaxed">
                                  ℹ️ <span className="font-semibold">Importante:</span> Esta información no se guarda en tu perfil. Asegúrate de usar un teléfono válido.
                                </p>
                              </div>
                              {errors.additionalContactPhoneNumber && (
                                <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                                  <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                                  {errors.additionalContactPhoneNumber}
                                </p>
                              )}
                              {!errors.additionalContactPhoneNumber && formData.additionalContactPhoneNumber && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Tu teléfono completo: <span className="font-medium">+56{formData.additionalContactPhoneNumber}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Error general */}
                      {errors.showProfileEmail && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-800 leading-relaxed font-medium">
                            ⚠️ {errors.showProfileEmail}
                          </p>
                        </div>
                      )}

                      {/* Resumen */}
                      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                        <p className="text-xs text-gray-900 font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          Resumen de contacto visible:
                        </p>
                        {(formData.showProfileEmail || formData.showProfilePhone) ? (
                          <ul className="text-xs text-gray-700 space-y-1.5 ml-6 list-disc">
                            {formData.showProfileEmail && (
                              <li>
                                <span className="font-semibold">Email:</span>{" "}
                                {formData.additionalContactEmail.trim() 
                                  ? formData.additionalContactEmail 
                                  : "Tu email institucional de perfil"}
                              </li>
                            )}
                            {formData.showProfilePhone && (
                              <li>
                                <span className="font-semibold">Teléfono:</span>{" "}
                                {formData.additionalContactPhoneNumber.trim() 
                                  ? formData.additionalContactPhoneNumber 
                                  : "Tu teléfono institucional de perfil"}
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-xs text-yellow-700 ml-1">
                            ⚠️ Selecciona al menos un tipo de contacto para mostrar
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contacto adicional para Job Offers */}
                  {isJobOffer && (
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass + " text-gray-700"}>
                          Email Adicional <span className="text-xs font-normal text-gray-500">(Opcional)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Agrega un email adicional si deseas recibir consultas en otra dirección.
                        </p>
                        <div className="relative">
                          <input
                            type="email"
                            name="additionalContactEmail"
                            value={formData.additionalContactEmail}
                            onChange={handleInputChange}
                            className={inputClass(!!errors.additionalContactEmail)}
                            placeholder="correo.adicional@ejemplo.com"
                          />
                          <Mail
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            size={18}
                          />
                        </div>
                        {errors.additionalContactEmail && (
                          <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                            <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                            {errors.additionalContactEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass + " text-gray-700"}>
                          Teléfono Adicional <span className="text-xs font-normal text-gray-500">(Opcional)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Agrega un número adicional si deseas recibir llamadas en otro teléfono.
                        </p>
                        <div className="relative">
                          <input
                            type="tel"
                            name="additionalContactPhoneNumber"
                            value={formatPhoneDisplay(formData.additionalContactPhoneNumber)}
                            onChange={handlePhoneChange}
                            className={`${inputClass(!!errors.additionalContactPhoneNumber)} pl-20`}
                            placeholder="9 1234 5678"
                            maxLength={11}
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 pointer-events-none z-10">
                            <Phone size={14} />
                            <span className="text-sm font-semibold">+56</span>
                          </div>
                        </div>
                        {errors.additionalContactPhoneNumber && (
                          <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                            <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                            {errors.additionalContactPhoneNumber}
                          </p>
                        )}
                        {!errors.additionalContactPhoneNumber && formData.additionalContactPhoneNumber && (
                          <p className="text-gray-500 text-xs mt-1">
                            Tu teléfono completo: <span className="font-medium">+56{formData.additionalContactPhoneNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* --- DETALLES DE VENTA --- */}
                {isProduct && (
                  <div className={sectionClass + " animate-in fade-in slide-in-from-bottom-4 duration-500"}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-purple-100">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Detalles del Artículo
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Información principal del producto
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Categoría y Condición */}
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
                              <option value="Electronica" className="text-gray-900 bg-white">
                                Electrónica
                              </option>
                              <option value="Ropa" className="text-gray-900 bg-white">
                                Ropa
                              </option>
                              <option value="Hogar" className="text-gray-900 bg-white">
                                Hogar
                              </option>
                              <option value="Vehiculos" className="text-gray-900 bg-white">
                                Vehículos
                              </option>
                              <option value="Deportes" className="text-gray-900 bg-white">
                                Deportes
                              </option>
                              <option value="Libros" className="text-gray-900 bg-white">
                                Libros
                              </option>
                              <option value="Musica" className="text-gray-900 bg-white">
                                Música
                              </option>
                              <option value="Juguetes" className="text-gray-900 bg-white">
                                Juguetes
                              </option>
                              <option value="Mascotas" className="text-gray-900 bg-white">
                                Mascotas
                              </option>
                              <option value="Otros" className="text-gray-900 bg-white">
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
                          <label className={labelClass}>Condición *</label>
                          <div className="relative">
                            <select
                              name="condition"
                              value={formData.condition}
                              onChange={handleInputChange}
                              className={
                                inputClass(!!errors.condition) + " appearance-none"
                              }
                            >
                              <option value="" className="text-gray-900 bg-white">
                                Selecciona...
                              </option>
                              <option value="Nuevo" className="text-gray-900 bg-white">
                                Nuevo
                              </option>
                              <option value="ComoNuevo" className="text-gray-900 bg-white">
                                Como Nuevo
                              </option>
                              <option value="Usado" className="text-gray-900 bg-white">
                                Usado
                              </option>
                              <option value="NoAplica" className="text-gray-900 bg-white">
                                No Aplica
                              </option>
                            </select>
                            <Tag
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              size={18}
                            />
                          </div>
                          {errors.condition && (
                            <p className="text-red-500 text-xs mt-2 font-medium">
                              {errors.condition}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Precio y Cantidad */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Precio (CLP) *</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                              $
                            </span>
                            <input
                              type="number"
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              className={inputClass(!!errors.price) + " pl-8"}
                              placeholder="1000"
                              min="0"
                              max="100000000"
                            />
                          </div>
                          {errors.price && (
                            <p className="text-red-500 text-xs mt-2 font-medium">
                              {errors.price}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className={labelClass}>Cantidad *</label>
                          <div className="relative">
                            <input
                              type="number"
                              name="quantity"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              className={inputClass(!!errors.quantity)}
                              placeholder="1"
                              min="1"
                            />
                            <Package
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              size={18}
                            />
                          </div>
                          {errors.quantity && (
                            <p className="text-red-500 text-xs mt-2 font-medium">
                              {errors.quantity}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Ubicación y Disponibilidad */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Ubicación *</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              className={inputClass(!!errors.location)}
                              placeholder="Ej: Coquimbo, Antofagasta"
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

                        <div>
                          <label className={labelClass}>Disponibilidad *</label>
                          <div className="relative">
                            <select
                              name="availability"
                              value={formData.availability}
                              onChange={handleInputChange}
                              className={
                                inputClass(!!errors.availability) + " appearance-none"
                              }
                            >
                              <option value="Disponible" className="text-gray-900 bg-white">
                                Disponible
                              </option>
                              <option value="Vendido" className="text-gray-900 bg-white">
                                Vendido
                              </option>
                            </select>
                            <Info
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              size={18}
                            />
                          </div>
                          {errors.availability && (
                            <p className="text-red-500 text-xs mt-2 font-medium">
                              {errors.availability}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- SECCIÓN DE IMÁGENES PARA VENTA --- */}
                {isProduct && (
                  <div className={sectionClass + " animate-in fade-in slide-in-from-bottom-4 duration-500"}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-purple-100">
                        <ImageIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Imágenes del Producto
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Agrega hasta 3 imágenes (Opcional)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Image Upload Input */}
                      <div>
                        <label
                          htmlFor="image-upload"
                          className={`
                            relative flex flex-col items-center justify-center
                            w-full h-32 px-4 py-6 rounded-xl border-2 border-dashed
                            ${formData.images.length >= 3 
                              ? "border-gray-300 bg-gray-50 cursor-not-allowed" 
                              : "border-purple-300 bg-purple-50 hover:bg-purple-100 cursor-pointer transition-all"
                            }
                          `}
                        >
                          <div className="flex flex-col items-center justify-center text-center">
                            <Upload className={`w-8 h-8 mb-2 ${formData.images.length >= 3 ? "text-gray-400" : "text-purple-600"}`} />
                            <span className={`text-sm font-medium ${formData.images.length >= 3 ? "text-gray-500" : "text-purple-600"}`}>
                              {formData.images.length >= 3 
                                ? "Máximo de 3 imágenes alcanzado" 
                                : "Haz clic para subir imágenes"
                              }
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              PNG, JPG o WEBP (max. 5MB cada una)
                            </span>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            multiple
                            onChange={handleImageChange}
                            disabled={formData.images.length >= 3}
                            className="hidden"
                          />
                        </label>
                        {errors.images && (
                          <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                            <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                            {errors.images}
                          </p>
                        )}
                      </div>

                      {/* Image Preview Grid */}
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {formData.images.map((image, index) => (
                            <div
                              key={index}
                              className="relative group rounded-lg overflow-hidden border-2 border-gray-200 aspect-square"
                            >
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                aria-label="Eliminar imagen"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-white text-xs font-medium truncate">
                                  {image.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Counter */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {formData.images.length} de 3 imágenes seleccionadas
                        </span>
                        {formData.images.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearImages}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Eliminar todas
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- DETALLES DE OFERTA LABORAL --- */}
                {isJobOffer && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Cierre Postulaciones *</label>
                          <input
                            type="date"
                            name="applicationDeadline"
                            value={formData.applicationDeadline}
                            onChange={handleInputChange}
                            className={inputClass(!!errors.applicationDeadline)}
                          />
                          {errors.applicationDeadline && (
                            <p className="text-red-500 text-xs mt-2 font-medium">
                              {errors.applicationDeadline}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={labelClass}>Fecha de Término *</label>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className={inputClass(!!errors.endDate)}
                          />
                          {errors.endDate && (
                            <p className="text-red-500 text-xs mt-2 font-medium">
                              {errors.endDate}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remuneración y Ubicación */}
                    <div className={sectionClass}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-purple-100">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                            Remuneración y Ubicación
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Especifica el pago y lugar de trabajo
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>
                            Remuneración {formData.offerType === "JobOffer" && "*"}
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                              $
                            </span>
                            <input
                              type="number"
                              name="remuneration"
                              value={formData.offerType === "Volunteering" ? "" : formData.remuneration}
                              onChange={handleInputChange}
                              className={inputClass(!!errors.remuneration) + " pl-8"}
                              placeholder={formData.offerType === "Volunteering" ? "No aplica" : "0.00"}
                              disabled={formData.offerType === "Volunteering"}
                              min={formData.offerType === "JobOffer" ? "1" : "0"}
                            />
                          </div>
                          {formData.offerType === "Volunteering" && (
                            <p className="text-yellow-600 text-xs mt-2 font-medium">
                              Un voluntariado no tiene remuneración
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
                    </div>

                    {/* Número de Postulantes */}
                    <div className={sectionClass}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-purple-100">
                          <ClipboardList className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                            Número de Postulantes
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Indica cuántas personas necesitas contratar para este puesto
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Postulantes Requeridos *
                        </label>
                        <p className="text-xs text-gray-600 mb-2">
                          Especifica cuántas vacantes hay disponibles. Las postulaciones se cerrarán automáticamente al alcanzar este límite.
                        </p>
                        <input
                          type="number"
                          name="requiredApplicants"
                          value={formData.requiredApplicants}
                          onChange={handleInputChange}
                          className={inputClass(!!errors.requiredApplicants)}
                          placeholder="1"
                          min="1"
                          max="50"
                        />
                        {errors.requiredApplicants && (
                          <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                            <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                            {errors.requiredApplicants}
                          </p>
                        )}
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-900 leading-relaxed">
                            💡 <span className="font-semibold">Tip:</span> Si necesitas contratar varias personas para el mismo puesto, indica el número total aquí. Por ejemplo, si buscas 3 ayudantes, ingresa "3".
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
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}