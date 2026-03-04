import {
  PostulantDetailForAdmin,
} from "@/models/responses";

type BadgeDisplayType = "Oferta"| "CompraVenta";

export function getOfferTypeDisplay(type: BadgeDisplayType) {
switch (type) {
    case "CompraVenta":
      return {
        text: "Compra y Venta",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      };
    case "Oferta":
      return {
        text: "Oferta de Trabajo",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      };
  }
}

export type AdminItemType = "Oferta" | "CompraVenta";


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