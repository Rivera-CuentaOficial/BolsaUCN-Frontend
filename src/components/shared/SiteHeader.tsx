"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  getProfileRoute,
  getUserFromToken,
  getTokenFromCookie,
  ROLES,
  UserRoles,
  isLoggedIn,
  getRolesFromToken,
  logoutAndRedirect,
  cn,
} from "@/lib";
import { ChevronDown, Menu, X } from "lucide-react";
import { profileService } from "@/services/profileService";

const userLinks = [
  { href: "/", label: "Inicio" },
  { href: "/offers", label: "Explorar" },
];

const adminNavLinks = [
  { href: "/landing/admin", label: "Inicio" },
  { href: "/admin/publications/validate", label: "Validar" },
  { href: "/admin/publications/manage", label: "Administrar" },
  { href: "/offerer/create-publication", label: "Publicar" },
  { href: "/admin/users", label: "Usuarios" }
];

const offererNavLinks = [
  { href: "/landing/offeror", label: "Inicio" },
  { href: "/offerer/create-publication", label: "Publicar" },
  { href: "/offerer/your-publications", label: "Mis Publicaciones" },
];

const studentNavLinks = [
  { href: "/landing/applicant", label: "Inicio" },
  { href: "/offerer/create-publication", label: "Publicar" },
  { href: "/offerer/your-publications", label: "Mis Publicaciones" },
];

function UserAvatar({ name, photoUrl, showName = true }: { name?: string; photoUrl?: string; showName?: boolean }) {
  const initials =
    name
      ?.trim()
      ?.split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="flex items-center gap-2">
      <div className="size-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--pop)] p-0.5">
        <div className="w-full h-full rounded-full bg-white grid place-items-center overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Foto"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[var(--primary)] font-bold text-sm">
              {initials}
            </span>
          )}
        </div>
      </div>
      {showName && (
        <span className="text-[var(--ink)] font-medium">
          {name ?? "Usuario"}
        </span>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [auth, setAuth] = useState({
    logged: false,
    name: "Usuario",
    roles: [] as UserRoles[],
    userType: null as string | null,
    photoUrl: null as string | null,
    superAdmin: false
  });

  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const loadPhoto = async () => {
    const res = await profileService.getProfilePhoto();
    if (res.data?.photoUrl) {
      setAuth((prev) => ({
        ...prev,
        photoUrl: `${res.data.photoUrl}?v=${Date.now()}`,
      }));
    }
  };

  useEffect(() => {
    const logged = isLoggedIn();
    const token = getTokenFromCookie();
    const info = token ? getUserFromToken() : null;
    const userRoles = getRolesFromToken();
    const tokenData = getUserFromToken();

    setAuth({
      logged,
      name: info?.userName || info?.email?.split("@")[0] || "Usuario",
      roles: userRoles as UserRoles[],
      userType: tokenData?.userType || null,
      photoUrl: null,
      superAdmin: userRoles.includes("SuperAdmin")
    });

    if (logged) {
      loadPhoto();
    }
  }, [pathname]);

  useEffect(() => {
    const handlePhotoUpdate = () => {
      if (auth.logged) {
        loadPhoto();
      }
    };
    window.addEventListener("profilePhotoUpdated", handlePhotoUpdate);
    return () =>
      window.removeEventListener("profilePhotoUpdated", handlePhotoUpdate);
  }, [auth.logged]);

  const dropdownItems = useMemo(() => {
    const baseItems = [
      {
        href: "/profile",
        label: "Editar perfil",
      },
      ...(!auth.roles.includes(ROLES.ADMIN)
        ? [{ href: "/jobs/history", label: "Mis Postulaciones" }]
        : []),

      { href: "/jobs/reviews", label: "Mis Reseñas" },
      { href: "/offerer/create-publication", label: "Publicar" },
      { href: "/offerer/your-publications", label: "Mis Publicaciones" },
    ];

    if (auth.roles.includes(ROLES.ADMIN)) {
      baseItems.push({ 
        href: "/admin/users", 
        label: "Ver usuarios" });
    }
    if (auth.roles.includes(ROLES.SUPER_ADMIN)) {
      baseItems.push({ 
        href: "/auth/register/admin", 
        label: "Crear administrador"})
    }

    return baseItems.map((item) => {
      if (item.label !== "Historial de trabajos") return item;
      let newHref = "/jobs/reviews";
      if (auth.roles.includes(ROLES.ADMIN)) newHref = "/jobs/reports";
      return { ...item, href: newHref };
    });
  }, [auth.userType, auth.roles, auth.superAdmin]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
      if (!mobileMenuRef.current?.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    if (open || mobileMenuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, mobileMenuOpen]);

  const isAdmin = auth.roles.includes(ROLES.ADMIN);
  const isOfferer = auth.roles.includes(ROLES.OFFEROR);
  const isStudent = auth.roles.includes(ROLES.APPLICANT);

  const mainLinks = isAdmin ? adminNavLinks : isOfferer ? offererNavLinks : isStudent ? studentNavLinks : userLinks;
  const logoHref = isAdmin ? "/landing/admin" : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-(--border) bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href={logoHref}
          className="flex items-center gap-2 font-extrabold text-xl group z-50"
        >
          <span className="text-(--ink)">Bolsa</span>
          <span className="px-3 py-1 rounded-xl bg-white text-(--primary) border border-(--primary) font-bold shadow-sm">
            FEUCN
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-medium text-(--muted-ink) hover:text-(--ink) hover:bg-(--chip) transition-all",
                pathname === l.href &&
                  "bg-(--chip) text-(--primary) font-semibold"
              )}
            >
              {l.label}
            </Link>
          ))}

          {!auth.logged ? (
            <Link
              href="/auth/login"
              className="ml-2 rounded-xl px-5 py-2.5 font-semibold text-white bg-linear-to-r from-(--primary) to-(--pop) hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Ingresar
            </Link>
          ) : (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setOpen(v => !v)}
                className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-(--chip) transition-all"
              >
                <UserAvatar
                  name={auth.name}
                  photoUrl={auth.photoUrl ?? undefined}
                  showName={true}
                />
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-(--muted-ink) transition-transform",
                    open && "rotate-180"
                  )}
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-(--border) bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-sm text-(--ink) hover:bg-(--chip) transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-(--border)" />
                  <button
                    onClick={() => logoutAndRedirect("/")}
                    className="cursor-pointer w-full text-left px-4 py-3 text-sm text-(--pop) font-medium hover:bg-red-50 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu - User Avatar/Name or Login Button */}
        <div className="lg:hidden" ref={mobileMenuRef}>
          {!auth.logged ? (
            <Link
              href="/auth/login"
              className="rounded-xl px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-(--primary) to-(--pop) hover:opacity-90 transition-all shadow-md hover:shadow-lg text-sm"
            >
              Ingresar
            </Link>
          ) : (
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-(--chip) transition-all"
            >
              <UserAvatar
                name={auth.name}
                photoUrl={auth.photoUrl ?? undefined}
                showName={false}
              />
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-(--ink)" />
              ) : (
                <Menu className="w-5 h-5 text-(--ink)" />
              )}
            </button>
          )}

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && auth.logged && (
            <div className="absolute right-4 top-16 w-64 rounded-2xl border border-(--border) bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-(--border) bg-(--chip)">
                <UserAvatar
                  name={auth.name}
                  photoUrl={auth.photoUrl ?? undefined}
                  showName={true}
                />
              </div>

              {/* Main Navigation Links */}
              <div className="border-b border-(--border)">
                {mainLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block px-4 py-3 text-sm text-(--ink) hover:bg-(--chip) transition-colors",
                      pathname === link.href && "bg-(--chip) text-(--primary) font-semibold"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* User Dropdown Items */}
              <div className="border-b border-(--border)">
                {dropdownItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 text-sm text-(--ink) hover:bg-(--chip) transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutAndRedirect("/");
                }}
                className="cursor-pointer w-full text-left px-4 py-3 text-sm text-(--pop) font-medium hover:bg-red-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}