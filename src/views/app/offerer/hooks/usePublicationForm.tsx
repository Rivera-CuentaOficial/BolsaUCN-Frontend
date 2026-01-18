import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
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
  type: string; // '1' = Trabajo, '2' = Venta
  // Campos Oferta Trabajo
  endDate: string;
  applicationDeadline: string;
  remuneration: string;
  location: string;
  requirements: string;
  isCvRequired: boolean;
  offerType: string; // Full Time, Part Time, etc.
  // Campos Venta
  category: string;
  price: string;
  // Comunes
  additionalContactInfo: string;
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
    type: "0", // Por defecto Oferta Laboral
    endDate: "",
    applicationDeadline: "",
    remuneration: "",
    location: "",
    requirements: "",
    additionalContactInfo: "",
    isCvRequired: false,
    offerType: "",
    category: "",
    price: "",
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
    if (!formData.additionalContactInfo.trim())
      newErrors.additionalContactInfo = "El contacto es requerido";

    // --- VALIDACIONES SOLO PARA OFERTA LABORAL (TIPO 1) ---
    if (isJobOffer) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalizar fecha actual

      if (!formData.applicationDeadline)
        newErrors.applicationDeadline = "Cierre de postulaciones requerido";
      if (!formData.location.trim())
        newErrors.location = "La ubicación es requerida";
      if (!formData.endDate) newErrors.endDate = "Fecha de término requerida";

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
          OfferType: formData.offerType === "JobOffer" ? 0 : 1,
          EndDate: formData.endDate,
          ApplicationDeadline: formData.applicationDeadline,
          Remuneration: formData.remuneration
            ? parseFloat(formData.remuneration)
            : 0,
          Location: formData.location,
          Requirements: formData.requirements,
          AdditionalContactInfo: formData.additionalContactInfo,
          IsCvRequired: formData.isCvRequired,
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
          ContactInfo: formData.additionalContactInfo,
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
