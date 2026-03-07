import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { validators } from "@/utils/AuthValidatorsUtil"
import { offererPublicationService } from "@/services/offererPublicationService"; // Asegúrate de importar la interfaz
import { buildLoginUrl, extractUserFromJwt } from "@/lib/auth";
import { CreateBuySellData } from "@/models/responses";

/**
 * Interfaz que define la estructura de los datos del formulario de publicación.
 * Unifica los campos necesarios tanto para Ofertas Laborales (Tipo 1) como para Ventas (Tipo 2).
 */
export interface PublicationFormData {
  title: string;
  description: string;
  type: string; // '0' = Trabajo, '1' = Venta
  // Campos Oferta Trabajo
  endDate: string;
  applicationDeadline: string;
  remuneration: string;
  location: string;
  requirements: string;
  isCvRequired: boolean;
  requiredApplicants: string;
  offerType: string; // Full Time, Part Time, etc.
  // Campos Venta
  images: File[]; // Para almacenar las imágenes seleccionadas
  category: string;
  price: string;
  quantity: string;
  availability: string; // Disponible, Vendido
  condition: string; // Nuevo, ComoNuevo, Usado, NoAplica
  // Contacto
  additionalContactEmail: string;
  additionalContactPhoneNumber: string;
  // Contacto Venta
  showProfileEmail: boolean;
  showProfilePhone: boolean;
}

/**
 * Hook personalizado para manejar la lógica del formulario de creación de publicaciones.
 * Gestiona el estado, la autenticación, las validaciones condicionales y el envío de datos a la API.
 */
export const usePublicationForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PublicationFormData, string>>
  >({});

  // Estado inicial del formulario con valores por defecto
  const [formData, setFormData] = useState<PublicationFormData>({
    title: "",
    description: "",
    type: "", // Por defecto Oferta Laboral
    endDate: "",
    applicationDeadline: "",
    remuneration: "",
    location: "",
    requirements: "",
    additionalContactEmail: "",
    additionalContactPhoneNumber: "",
    isCvRequired: false,
    requiredApplicants: "1",
    offerType: "",
    category: "",
    price: "",
    quantity: "1",
    availability: "Disponible",
    condition: "",
    showProfileEmail: false,
    showProfilePhone: false,
    images: [],
  });

  // 1. Verificación de Autenticación: Redirige al login si no hay token.
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      const currentPath = window.location.pathname;
      window.location.href = buildLoginUrl(currentPath, "login_required");
    } else {
      setIsLoading(false);
    }
  }, []);

  /**
   * Maneja los cambios en los inputs del formulario (Texto, Select, Checkbox).
   * Incluye lógica específica para resetear la remuneración si se selecciona "Voluntariado".
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      // Regla de negocio: Si es voluntariado, la remuneración debe ser 0.
      if (name === "offerType" && value === "Volunteering") {
        newData.remuneration = "0";
      }
      return newData;
    });
    // Limpiar error al escribir
    if (errors[name as keyof PublicationFormData] || name === "offerType") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        // Si cambia el tipo de trabajo, limpiamos también el error de remuneración
        ...(name === "offerType" ? { remuneration: "" } : {}),
      }));
    }
  };

  /**
   * Formatea el número de teléfono para mostrar (9 1234 5678)
   */
  const formatPhoneDisplay = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 1) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
    return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)}`;
  };

  /**
   * Maneja cambios en el campo de teléfono (solo acepta 9 dígitos)
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData((prev) => ({
      ...prev,
      additionalContactPhoneNumber: digits,
    }));
    // Limpiar error al escribir
    if (errors.additionalContactPhoneNumber) {
      setErrors((prev) => ({ ...prev, additionalContactPhoneNumber: "" }));
    }
  };

  /**
   * Maneja la selección de imágenes para publicaciones de compra/venta
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    
    // Validar que no se excedan las 3 imágenes
    if (formData.images.length + newImages.length > 3) {
      setErrors((prev) => ({
        ...prev,
        images: "No puedes subir más de 3 imágenes",
      }));
      return;
    }

    // Agregar nuevas imágenes
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));

    // Limpiar error si había
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  /**
   * Elimina una imagen seleccionada
   */
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /**
   * Elimina todas las imágenes seleccionadas
   */
  const handleClearImages = () => {
    setFormData((prev) => ({
      ...prev,
      images: [],
    }));
  };

  /**
   * Valida los datos del formulario antes de enviar.
   * Aplica reglas diferentes dependiendo si es una Oferta Laboral o una Venta.
   * @returns {boolean} True si el formulario es válido, False si hay errores.
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PublicationFormData, string>> = {};
    const isJobOffer = formData.type === "0";
    const isProduct = formData.type === "1";

    // Validaciones Comunes
    if (!formData.title.trim()) newErrors.title = "El título es requerido";
    if (!formData.description)
      newErrors.description = "La descripción es requerida";

    // Validación de email adicional (opcional pero debe ser válido si se ingresa)
    if (formData.additionalContactEmail && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.additionalContactEmail)) {
      newErrors.additionalContactEmail = "Email inválido";
    }
    // Validación de teléfono adicional (opcional pero debe tener formato válido si se ingresa)
    if (formData.additionalContactPhoneNumber){
      const phoneError = validators.phone(formData.additionalContactPhoneNumber);
      if (phoneError) {
        newErrors.additionalContactPhoneNumber = phoneError;
      }
    }

    // --- VALIDACIONES SOLO PARA OFERTA LABORAL (TIPO 1) ---
    if (isJobOffer) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalizar fecha actual

      if (!formData.applicationDeadline)
        newErrors.applicationDeadline = "Cierre de postulaciones requerido";
      if (!formData.location.trim())
        newErrors.location = "La ubicación es requerida";
      if (!formData.endDate) newErrors.endDate = "Fecha de término requerida";

      if (!formData.requiredApplicants) {
        newErrors.requiredApplicants = "Número de postulantes requerido";
      } else {
        const numApplicants = parseInt(formData.requiredApplicants, 10);
        if (isNaN(numApplicants) || numApplicants <= 0) {
          newErrors.requiredApplicants = "Debe ser un número entero positivo";
        } else if (numApplicants > 50) {
          newErrors.requiredApplicants = "Número de postulantes demasiado alto";
        }
      }

      // Validar coherencia de fechas
      if (formData.applicationDeadline && new Date(formData.applicationDeadline) < today)
        newErrors.applicationDeadline = "La fecha no puede ser pasada";

      if (
        formData.endDate &&
        formData.applicationDeadline &&
        new Date(formData.endDate) <= new Date(formData.applicationDeadline)
      ) {
        newErrors.endDate =
          "El término debe ser después del cierre de postulaciones";
      }

      if (!formData.offerType)
        newErrors.offerType = "Selecciona el tipo de oferta";

      // Validación específica: Voluntariado sin remuneración
      if (
        formData.offerType === "Volunteering" &&
        parseFloat(formData.remuneration || "0") > 0
      ) {
        newErrors.remuneration =
          "Un voluntariado no puede tener remuneración mayor a 0";
      }

      if (
        formData.offerType === "JobOffer" &&
        parseFloat(formData.remuneration || "0") <= 0
      ) {
        newErrors.remuneration =
          "La remuneración debe ser mayor a 0 para una oferta de trabajo";
      }
    }

    // --- VALIDACIONES SOLO PARA VENTA (TIPO 2) ---
    if (isProduct) {
      if (!formData.category) newErrors.category = "Selecciona una categoría";

      if (!formData.price) {
        newErrors.price = "El precio es requerido";
      } else if (parseFloat(formData.price) < 0) {
        newErrors.price = "El precio no puede ser negativo";
      } else if (parseFloat(formData.price) > 100000000) {
        newErrors.price = "El precio no puede exceder $100.000.000";
      }

      if (!formData.location.trim()) {
        newErrors.location = "La ubicación es requerida";
      }

      if (!formData.quantity) {
        newErrors.quantity = "La cantidad es requerida";
      } else {
        const qty = parseInt(formData.quantity, 10);
        if (isNaN(qty) || qty < 1) {
          newErrors.quantity = "La cantidad debe ser al menos 1";
        }
      }

      if (!formData.availability) {
        newErrors.availability = "Selecciona la disponibilidad";
      }

      if (!formData.condition) {
        newErrors.condition = "Selecciona la condición del artículo";
      }
    
      const hasContactInfo = 
        formData.showProfileEmail ||
        formData.showProfilePhone ||
        formData.additionalContactEmail.trim() !== "" ||
        formData.additionalContactPhoneNumber.trim() !== "";

      if (!hasContactInfo) {
        newErrors.showProfileEmail = "Debes seleccionar al menos un método de contacto para mostrar"
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario al servidor.
   * Selecciona el servicio adecuado (createJobOffer o createBuySell) según el tipo de oferta.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const isJobOffer = formData.type === "0";

      if (isJobOffer) {
        // --- LÓGICA PARA OFERTA LABORAL (TIPO 1) ---
        await offererPublicationService.create({
          Title: formData.title,
          Description: formData.description,
          OfferType: formData.offerType === "JobOffer" ? "Trabajo" : "Voluntariado",
          EndDate: formData.endDate,
          ApplicationDeadline: formData.applicationDeadline,
          Remuneration: formData.offerType === "Volunteering"
            ? null
            : (formData.remuneration ? parseFloat(formData.remuneration) : 0),
          Location: formData.location,
          AdditionalContactEmail: formData.additionalContactEmail,
          AdditionalContactPhoneNumber: formData.additionalContactPhoneNumber 
            ? (formData.additionalContactPhoneNumber.startsWith('+56') 
                ? formData.additionalContactPhoneNumber 
                : `+56${formData.additionalContactPhoneNumber}`)
            : undefined,
          IsCvRequired: formData.isCvRequired,
          RequiredApplicants: parseInt(formData.requiredApplicants || "1"),

        });
      } else {
        // --- LÓGICA PARA VENTA (TIPO 2) ---
        // Preparar FormData para enviar archivos y datos
        const formDataToSend : CreateBuySellData = {
          Title: formData.title,
          Description: formData.description,
          Category: formData.category,
          Price: parseFloat(formData.price),
          Location: formData.location,
          Quantity: parseInt(formData.quantity, 10),
          Availability: formData.availability,
          Condition: formData.condition,
          ShowEmail: formData.showProfileEmail,
          ShowPhoneNumber: formData.showProfilePhone,
          AdditionalContactEmail: formData.additionalContactEmail ? formData.additionalContactEmail : undefined,
          AdditionalContactPhoneNumber: formData.additionalContactPhoneNumber 
            ? (formData.additionalContactPhoneNumber.startsWith('+56') 
                ? formData.additionalContactPhoneNumber 
                : `+56${formData.additionalContactPhoneNumber}`)
            : undefined,
          Images: formData.images
        }

        await offererPublicationService.createBuySell(formDataToSend);
      }

      // Obtener el rol del token para construir la ruta de redirección
      const token = Cookies.get("token");
      let rolePath = "offerer"; // Ruta por defecto
      if (token) {
        try {
          const decoded = extractUserFromJwt(token);
          // Si es Admin usa 'admin', si es Offerent/Offerer usa 'offerer'
          if (decoded?.role === "Admin") rolePath = "admin";
          if (decoded?.role === "Applicant") rolePath = "students";
        } catch (e) {
          console.error("Error leyendo rol", e);
        }
      }

      toast.success("Publicación creada exitosamente");
      setTimeout(() => {
        // Corrección: Usar backticks ` para que funcione la interpolación ${rolePath}
        router.push(`/${rolePath}/your-publications?success=true`);
      }, 1500);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.errors) {
        const serverErrors: any = {};
        const errorsData = error.response.data.errors;
        Object.keys(errorsData).forEach((key) => {
          // Mapeo simple de errores del backend a tus inputs
          serverErrors[key.toLowerCase()] = errorsData[key][0];
        });
        setErrors(serverErrors);
      } else {
        const msg =
          error instanceof AxiosError
            ? error.response?.data?.message || "Error al conectar"
            : "Error inesperado";
        toast.error(msg);
      }
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
