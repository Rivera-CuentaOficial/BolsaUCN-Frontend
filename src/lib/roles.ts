// Roles disponibles en la aplicación
export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  ADMIN: "Admin",
  OFFEROR: "Offeror",
  APPLICANT: "Applicant",
} as const;

export type UserRoles = typeof ROLES[keyof typeof ROLES];