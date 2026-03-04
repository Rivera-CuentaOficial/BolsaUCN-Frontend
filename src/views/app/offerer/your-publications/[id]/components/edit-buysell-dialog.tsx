"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, DollarSign, MapPin, Package, Tag, Image as ImageIcon, Trash2, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import type { MyPublicationDetails, EditBuySellData } from "@/models/responses";
import { validators } from "@/utils/AuthValidatorsUtil";

interface EditBuySellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  publication: MyPublicationDetails;
  onSave: (data: EditBuySellData) => Promise<boolean>;
  isSaving: boolean;
}

const CATEGORIES = [
  "Electronica",
  "Ropa",
  "Hogar",
  "Vehiculos",
  "Deportes",
  "Libros",
  "Musica",
  "Juguetes",
  "Mascotas",
  "Otros",
];

const CATEGORY_LABELS: Record<string, string> = {
  Electronica: "Electrónica",
  Ropa: "Ropa",
  Hogar: "Hogar",
  Vehiculos: "Vehículos",
  Deportes: "Deportes",
  Libros: "Libros",
  Musica: "Música",
  Juguetes: "Juguetes",
  Mascotas: "Mascotas",
  Otros: "Otros",
};

const CONDITIONS = [
  { value: "Nuevo", label: "Nuevo" },
  { value: "ComoNuevo", label: "Como Nuevo" },
  { value: "Usado", label: "Usado" },
  { value: "NoAplica", label: "No Aplica" },
];

export function EditBuySellDialog({
  isOpen,
  onClose,
  publication,
  onSave,
  isSaving,
}: EditBuySellDialogProps) {
  const [formData, setFormData] = useState({
    title: publication.title,
    description: publication.description,
    price: publication.price?.toString() || "",
    location: publication.location,
    category: publication.category || "",
    quantity: publication.quantity?.toString() || "1",
    condition: publication.condition || "Usado",
    alternativeEmail: publication.additionalContactEmail || "",
    alternativePhone: (publication.additionalContactPhoneNumber || "").replace(/^\+56/, ""),
    showEmail: publication.showEmail ?? false,
    showPhone: publication.showPhoneNumber ?? false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setFormData({
        title: publication.title,
        description: publication.description,
        price: publication.price?.toString() || "",
        location: publication.location,
        category: publication.category || "",
        quantity: publication.quantity?.toString() || "1",
        condition: publication.condition || "Usado",
        alternativeEmail: publication.additionalContactEmail || "",
        alternativePhone: (publication.additionalContactPhoneNumber || "").replace(/^\+56/, ""),
        showEmail: publication.showEmail ?? false,
        showPhone: publication.showPhoneNumber ?? false,
      });
      setFieldErrors({});
      setImagesToDelete([]);
      setImagesToUpload([]);
      setImagePreviewUrls([]);
    }
  }, [isOpen, publication]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Format phone number for display (9 1234 5678)
  const formatPhoneDisplay = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 1) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
    return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)}`;
  };

  // Handle phone number changes (only accepts 9 digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData((prev) => ({
      ...prev,
      alternativePhone: digits,
    }));
    // Clear error on change
    if (fieldErrors.alternativePhone) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.alternativePhone;
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentImageCount = existingImages.length + imagesToUpload.length;
    const remainingSlots = 3 - currentImageCount;

    if (remainingSlots <= 0) {
      setFieldErrors((prev) => ({
        ...prev,
        images: "Ya tienes el máximo de 3 imágenes. Elimina algunas primero.",
      }));
      return;
    }

    const newFiles = Array.from(files).slice(0, remainingSlots);

    if (newFiles.length < files.length) {
      setFieldErrors((prev) => ({
        ...prev,
        images: `Solo se pueden agregar ${remainingSlots} imagen(es) más. Se seleccionaron ${newFiles.length}.`,
      }));
    }

    setImagesToUpload((prev) => [...prev, ...newFiles]);

    // Create preview URLs
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    // Clear error after 3 seconds if there was one
    if (fieldErrors.images) {
      setTimeout(() => {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }, 3000);
    }
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };

  const handleRemoveNewImage = (index: number) => {
    setImagesToUpload((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]); // Clean up memory
      return newUrls;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "El título es requerido.";
    }
    if (!formData.description.trim()) {
      errors.description = "La descripción es requerida.";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "El precio debe ser mayor a 0.";
    }
    if (!formData.location.trim()) {
      errors.location = "La ubicación es requerida.";
    }
    if (!formData.category) {
      errors.category = "La categoría es requerida.";
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      errors.quantity = "La cantidad debe ser mayor a 0.";
    }

    // Validate alternative contact info if provided
    if (formData.showEmail && formData.alternativeEmail.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alternativeEmail)) {
        errors.alternativeEmail = "El email no es válido.";
      }
    }

    if (formData.showPhone && formData.alternativePhone.trim()) {
      const phoneError = validators.phone(formData.alternativePhone);
      if (phoneError) {
        errors.alternativePhone = phoneError;
      }
    }

    // Validate image count
    const totalImages = existingImages.length + imagesToUpload.length;
    if (totalImages > 3) {
      errors.images = "No puedes tener más de 3 imágenes en total.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    const editData: EditBuySellData = {
      Title: formData.title,
      Description: formData.description,
      Price: parseFloat(formData.price),
      Location: formData.location,
      Category: formData.category,
      Quantity: parseInt(formData.quantity),
      Condition: formData.condition,
      ShowEmail: formData.showEmail,
      ShowPhoneNumber: formData.showPhone,
      AdditionalContactEmail: formData.alternativeEmail.trim() || undefined,
      AdditionalContactPhoneNumber: formData.alternativePhone.trim()
        ? (formData.alternativePhone.startsWith('+56')
            ? formData.alternativePhone
            : `+56${formData.alternativePhone}`)
        : undefined,
      ImagesToDelete: imagesToDelete.length > 0 ? imagesToDelete : undefined,
      ImagesToUpload: imagesToUpload.length > 0 ? imagesToUpload : undefined,
    };

    const success = await onSave(editData);
    if (success) {
      // Clean up preview URLs
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      onClose();
    }
  };

  const existingImages = (publication.imageUrls || []).filter(
    (url) => !imagesToDelete.includes(url)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Editar Publicación
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Modifica los detalles de tu producto o servicio a la venta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Título
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Notebook Dell Inspiron 15"
              className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${fieldErrors.title
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                }`}
            />
            {fieldErrors.title && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el producto o servicio..."
              rows={4}
              className={`px-4 py-3 border rounded-xl bg-white text-slate-700 resize-none ${fieldErrors.description
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                }`}
            />
            {fieldErrors.description && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Precio (CLP)
              </label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="50000"
                className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${fieldErrors.price
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                  }`}
              />
              {fieldErrors.price && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.price}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Cantidad
              </label>
              <Input
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="1"
                min="1"
                className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${fieldErrors.quantity
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                  }`}
              />
              {fieldErrors.quantity && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.quantity}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
                Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl bg-white text-slate-700 ${fieldErrors.category
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                  }`}
              >
                <option value="">Seleccionar...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.category}</p>
              )}
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Condición
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-700 focus:border-purple-500 focus:ring-purple-500"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Ubicación
            </label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej: Antofagasta, Chile"
              className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${fieldErrors.location
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                }`}
            />
            {fieldErrors.location && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.location}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="border-t border-slate-200 pt-4 mt-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Información de Contacto para esta Publicación
            </h3>
            <p className="text-xs text-slate-600 mb-2">
              Elige qué información de contacto mostrar en esta publicación.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>Tus datos de perfil:</strong> {publication.contactEmail} | {publication.contactPhone}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Puedes usar estos datos o ingresar información alternativa para proteger tu privacidad. Los datos alternativos NO se guardarán en tu perfil.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email checkbox */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showEmail}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        showEmail: checked,
                      }));
                      if (!checked && fieldErrors.alternativeEmail) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.alternativeEmail;
                          return newErrors;
                        });
                      }
                    }}
                    className="mt-0.5 h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-600" />
                      Mostrar email de contacto
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.showEmail ? "Se usará tu email de perfil" : "No se mostrará email"}
                    </p>
                    {formData.showEmail && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                          Email alternativo (opcional, solo para esta publicación)
                        </label>
                        <Input
                          type="email"
                          name="alternativeEmail"
                          value={formData.alternativeEmail}
                          onChange={handleChange}
                          placeholder={`Dejar vacío para usar ${publication.contactEmail}`}
                          className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${fieldErrors.alternativeEmail
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                            }`}
                        />
                        {fieldErrors.alternativeEmail && (
                          <p className="text-red-600 text-xs mt-1">
                            {fieldErrors.alternativeEmail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Phone checkbox */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showPhone}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        showPhone: checked,
                      }));
                      if (!checked && fieldErrors.alternativePhone) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.alternativePhone;
                          return newErrors;
                        });
                      }
                    }}
                    className="mt-0.5 h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-600" />
                      Mostrar teléfono de contacto
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.showPhone ? "Se usará tu teléfono de perfil" : "No se mostrará teléfono"}
                    </p>
                    {formData.showPhone && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                          Teléfono alternativo (opcional, solo para esta publicación)
                        </label>
                        <div className="relative">
                          <Input
                            type="tel"
                            name="alternativePhone"
                            value={formatPhoneDisplay(formData.alternativePhone)}
                            onChange={handlePhoneChange}
                            placeholder="9 1234 5678"
                            maxLength={11}
                            className={`px-4 py-3 pl-20 border rounded-xl bg-white text-slate-700 ${fieldErrors.alternativePhone
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                              }`}
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 pointer-events-none z-10">
                            <Phone className="w-3 h-3" />
                            <span className="text-sm font-semibold">+56</span>
                          </div>
                        </div>
                        {fieldErrors.alternativePhone && (
                          <p className="text-red-600 text-xs mt-1">
                            {fieldErrors.alternativePhone}
                          </p>
                        )}
                        {!fieldErrors.alternativePhone && formData.alternativePhone && (
                          <p className="text-slate-500 text-xs mt-1">
                            Tu teléfono completo: <span className="font-medium">+56{formData.alternativePhone}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="border-t border-slate-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imágenes del Producto
              </h3>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Máximo 3 imágenes
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-900 leading-relaxed">
                💡 <span className="font-semibold">Importante:</span> Solo puedes tener un máximo de 3 imágenes en total.
                Si quieres agregar nuevas imágenes, primero debes eliminar algunas de las existentes.
              </p>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Imágenes actuales ({existingImages.length})
                  </p>
                  <p className="text-xs text-slate-500">
                    Haz clic en el ícono de basurero para eliminar
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imageUrl)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                        <p className="text-white text-xs font-medium">
                          Imagen {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {imagePreviewUrls.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-purple-700">
                    Nuevas imágenes a subir ({imagePreviewUrls.length})
                  </p>
                  <p className="text-xs text-slate-500">
                    Haz clic en el ícono de basurero para cancelar
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Nueva imagen ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-purple-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                        title="Cancelar subida"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/70 to-transparent p-2 rounded-b-lg">
                        <p className="text-white text-xs font-medium">
                          Nueva {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <label className={`block ${(existingImages.length + imagePreviewUrls.length >= 3) ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${(existingImages.length + imagePreviewUrls.length >= 3)
                ? 'border-slate-300 bg-slate-50 opacity-50'
                : 'border-slate-300 hover:border-purple-500 hover:bg-purple-50'
                }`}>
                <ImageIcon className={`w-8 h-8 mx-auto mb-2 ${(existingImages.length + imagePreviewUrls.length >= 3) ? 'text-slate-400' : 'text-slate-400'
                  }`} />
                <p className={`text-sm font-medium ${(existingImages.length + imagePreviewUrls.length >= 3) ? 'text-slate-500' : 'text-slate-600'
                  }`}>
                  {(existingImages.length + imagePreviewUrls.length >= 3)
                    ? "Límite de 3 imágenes alcanzado"
                    : "Click para agregar más imágenes"
                  }
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG hasta 5MB cada una
                </p>
                {(existingImages.length + imagePreviewUrls.length < 3) && (
                  <p className="text-xs text-purple-600 font-semibold mt-2">
                    Puedes agregar {3 - existingImages.length - imagePreviewUrls.length} imagen(es) más
                  </p>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={existingImages.length + imagePreviewUrls.length >= 3}
                className="hidden"
              />
            </label>
            {fieldErrors.images && (
              <p className="text-red-600 text-xs mt-2 font-medium flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                {fieldErrors.images}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-full font-bold hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition disabled:bg-purple-400"
          >
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
