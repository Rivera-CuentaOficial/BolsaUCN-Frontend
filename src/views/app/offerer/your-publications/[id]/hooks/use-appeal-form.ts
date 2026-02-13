// frontend/src/views/app/offerer/your-publications/[id]/hooks/use-appeal-form.ts
import { useState, useEffect } from "react";
import { validators } from "@/utils/AuthValidatorsUtil";
import type { MyPublicationDetails } from "src/models/responses";

export interface AppealFormData {
  // Common fields
  title: string;
  description: string;
  location: string;
  additionalContactEmail: string;
  additionalContactPhoneNumber: string;

  // Offer fields
  endDate: string;
  applicationDeadline: string;
  remuneration: string;
  offerType: string;
  isCvRequired: boolean;
  requiredApplicants: string;

  // BuySell fields
  category: string;
  price: string;
  quantity: string;
  availability: string;
  condition: string;
}

export interface AppealFormErrors {
  [key: string]: string;
}

interface UseAppealFormProps {
  publication: MyPublicationDetails | null;
}

export const useAppealForm = ({ publication }: UseAppealFormProps) => {
  const [formData, setFormData] = useState<AppealFormData>({
    title: "",
    description: "",
    location: "",
    additionalContactEmail: "",
    additionalContactPhoneNumber: "",
    endDate: "",
    applicationDeadline: "",
    remuneration: "",
    offerType: "",
    isCvRequired: false,
    requiredApplicants: "1",
    category: "",
    price: "",
    quantity: "1",
    availability: "Disponible",
    condition: "NoAplica",
  });

  const [errors, setErrors] = useState<AppealFormErrors>({});

  // Initialize form data from publication
  useEffect(() => {
    if (!publication) return;

    const isOffer = publication.publicationType === "Oferta";

    setFormData({
      title: publication.title || "",
      description: publication.description || "",
      location: publication.location || "",
      additionalContactEmail: publication.additionalContactEmail || "",
      additionalContactPhoneNumber: publication.additionalContactPhoneNumber || "",
      // Offer fields
      endDate: publication.endDate?.split("T")[0] || "",
      applicationDeadline: publication.applicationDeadline?.split("T")[0] || "",
      remuneration: publication.remuneration?.toString() || "0",
      offerType: publication.offerType || "",
      isCvRequired: publication.isCvRequired || false,
      requiredApplicants: "1",
      // BuySell fields
      category: publication.category || "",
      price: publication.price?.toString() || "",
      quantity: publication.quantity?.toString() || "1",
      availability: publication.availability || "Disponible",
      condition: publication.condition || "NoAplica",
    });
  }, [publication]);

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

      // Business rule: Volunteering must have 0 remuneration
      if (name === "offerType") {
        if (value === "Voluntariado") {
          newData.remuneration = "0";
        }
      }

      return newData;
    });

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        if (name === "offerType") {
          delete newErrors["remuneration"];
        }
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!publication) return false;

    const newErrors: AppealFormErrors = {};
    const isOffer = publication.publicationType === "Oferta";
    const isBuySell = publication.publicationType === "CompraVenta";

    // Common validations
    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    } else if (formData.title.length < 5 || formData.title.length > 200) {
      newErrors.title = "El título debe tener entre 5 y 200 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (formData.description.length < 10 || formData.description.length > 2000) {
      newErrors.description = "La descripción debe tener entre 10 y 2000 caracteres";
    }

    if (formData.location && formData.location.length > 200) {
      newErrors.location = "La ubicación no puede exceder 200 caracteres";
    }

    // Email validation (optional but must be valid)
    if (
      formData.additionalContactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.additionalContactEmail)
    ) {
      newErrors.additionalContactEmail = "Email inválido";
    }

    // Phone validation (optional but must be valid)
    if (formData.additionalContactPhoneNumber) {
      const phoneError = validators.phone(formData.additionalContactPhoneNumber);
      if (phoneError) {
        newErrors.additionalContactPhoneNumber = phoneError;
      }
    }

    // Offer-specific validations
    if (isOffer) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!formData.endDate) {
        newErrors.endDate = "La fecha de finalización es requerida";
      } else {
        const endDate = new Date(formData.endDate);
        if (endDate < today) {
          newErrors.endDate = "La fecha de finalización debe ser en el futuro";
        }
      }

      if (!formData.applicationDeadline) {
        newErrors.applicationDeadline = "La fecha de cierre de postulaciones es requerida";
      } else {
        const deadline = new Date(formData.applicationDeadline);
        if (deadline < today) {
          newErrors.applicationDeadline = "La fecha no puede ser pasada";
        }

        if (formData.endDate) {
          const endDate = new Date(formData.endDate);
          if (endDate <= deadline) {
            newErrors.endDate = "La fecha de término debe ser después del cierre de postulaciones";
          }
        }
      }

      if (!formData.offerType) {
        newErrors.offerType = "Selecciona el tipo de oferta";
      }

      // Remuneration validation
      const remunerationValue = parseFloat(formData.remuneration || "0");
      if (formData.offerType === "Voluntariado" && remunerationValue > 0) {
        newErrors.remuneration = "Un voluntariado no puede tener remuneración mayor a 0";
      }

      if (formData.offerType === "Trabajo" && remunerationValue <= 0) {
        newErrors.remuneration = "La remuneración debe ser mayor a 0 para una oferta de trabajo";
      }

      if (remunerationValue < 0) {
        newErrors.remuneration = "La remuneración no puede ser negativa";
      }

      // Required applicants validation
      if (!formData.requiredApplicants) {
        newErrors.requiredApplicants = "El número de postulantes requeridos es obligatorio";
      } else {
        const requiredApplicantsValue = parseFloat(formData.requiredApplicants);
        if (isNaN(requiredApplicantsValue) || requiredApplicantsValue < 1) {
          newErrors.requiredApplicants = "Debe haber al menos 1 postulante requerido";
        } else if (requiredApplicantsValue > 50) {
          newErrors.requiredApplicants = "No puede exceder 50 postulantes requeridos";
        }
      }
    }

    // BuySell-specific validations
    if (isBuySell) {
      if (!formData.category) {
        newErrors.category = "La categoría es requerida";
      } else if (formData.category.length > 100) {
        newErrors.category = "La categoría no puede exceder 100 caracteres";
      }

      if (!formData.price) {
        newErrors.price = "El precio es requerido";
      } else {
        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue < 0) {
          newErrors.price = "El precio debe ser un número positivo";
        } else if (priceValue > 100000000) {
          newErrors.price = "El precio no puede exceder $100.000.000";
        }
      }

      if (formData.quantity) {
        const quantityValue = parseInt(formData.quantity, 10);
        if (isNaN(quantityValue) || quantityValue < 1) {
          newErrors.quantity = "La cantidad debe ser un número positivo";
        }
      }

      if (formData.availability && !["Disponible", "Vendido"].includes(formData.availability)) {
        newErrors.availability = "El tipo de disponibilidad no es válido";
      }

      if (formData.condition && !["Nuevo", "ComoNuevo", "Usado", "NoAplica"].includes(formData.condition)) {
        newErrors.condition = "La condición no es válida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setErrors({});
    // Re-initialize from publication
    if (publication) {
      setFormData({
        title: publication.title || "",
        description: publication.description || "",
        location: publication.location || "",
        additionalContactEmail: publication.additionalContactEmail || "",
        additionalContactPhoneNumber: publication.additionalContactPhoneNumber || "",
        endDate: publication.endDate?.split("T")[0] || "",
        applicationDeadline: publication.applicationDeadline?.split("T")[0] || "",
        remuneration: publication.remuneration?.toString() || "0",
        offerType: publication.offerType || "",
        isCvRequired: publication.isCvRequired || false,
        requiredApplicants: "1",
        category: publication.category || "",
        price: publication.price?.toString() || "",
        quantity: publication.quantity?.toString() || "1",
        availability: publication.availability || "Disponible",
        condition: publication.condition || "NoAplica",
      });
    }
  };

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    reset,
  };
};