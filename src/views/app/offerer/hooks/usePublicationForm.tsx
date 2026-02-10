import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { validators } from "@/utils/AuthValidatorsUtil"
import { offererPublicationService } from "src/services/offererPublicationService"; // Asegúrate de importar la interfaz
import { buildLoginUrl, extractUserFromJwt } from "src/lib/auth";
import { CreateBuySellData } from "@/models/responses";
import { useNotification } from "@/hooks/common/use-notification";

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
  category: string;
  price: string;
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
  const { notification, isVisible, show, close } = useNotification();

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
    showProfileEmail: false,
    showProfilePhone: false,
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
    if (!formData.description.trim())
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
          AdditionalContactPhoneNumber: formData.additionalContactPhoneNumber,
          IsCvRequired: formData.isCvRequired,
          RequiredApplicants: parseInt(formData.requiredApplicants || "1"),
          //ImagesURL: [],
        });
      } else {
        // --- LÓGICA PARA VENTA (TIPO 2) ---
        // 1. Preparamos el objeto JSON
        const buySellData: CreateBuySellData = {
          Title: formData.title,
          Description: formData.description,
          Category: formData.category,
          Price: parseFloat(formData.price || "0"),
          Location: formData.location,
          AdditionalContactEmail: formData.additionalContactEmail,
          AdditionalContactPhoneNumber: formData.additionalContactPhoneNumber,
          ImagesURL: [],
        };

        await offererPublicationService.createBuySell(buySellData);
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

      show("¡Éxito!", "Publicación creada exitosamente.", "success");
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
        show("Error", msg, "error");
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
    handleSubmit,
    notification,
    isVisible,
    closeNotification: close,
  };
};
