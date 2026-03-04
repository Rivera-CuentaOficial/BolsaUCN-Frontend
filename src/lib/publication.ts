import {
  PostulantDetailForAdmin,
} from "@/models/responses";

type BadgeDisplayType = "Oferta de Trabajo" | "Voluntariado" | "Compra/Venta";

export function getOfferTypeDisplay(type: BadgeDisplayType) {
switch (type) {
    case "Voluntariado":
      return {
        text: "Voluntariado",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      };
    case "Compra/Venta":
      return {
        text: "Compra y Venta",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      };
    case "Oferta de Trabajo":
    default:
      return {
        text: "Oferta de Trabajo",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      };
  }
}

export type AdminItemType = "Oferta de Trabajo" | "Compra/Venta";


export const getPresentationType = (modelType: string | undefined): string => {
    if (!modelType) return "Tipo Desconocido";

    switch (modelType) {
        case "Trabajo":
            return "Oferta de Trabajo";
        case "Voluntariado":
            return "Voluntariado";
        case "CompraVenta":
            return "Compra y Venta";
        default:
            return modelType;
    }
};

export const getApplicantDetailForAdmin = (dto: any): PostulantDetailForAdmin => {
    return {
        id: dto.id,
        studentName: dto.studentName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        status: dto.status,
        curriculumVitae: dto.curriculumVitae,
        rating: dto.rating,
        motivationLetter: dto.motivationLetter,
        disability: dto.disability,
        profilePicture: dto.ProfilePicture,
    };
}