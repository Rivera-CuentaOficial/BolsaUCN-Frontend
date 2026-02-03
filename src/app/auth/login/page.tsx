"use client";

import { useState, useEffect, Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { login } from "@/services/authService";
import type { LoginRequestDto } from "@/services/dtos/authDto";

//implementado para ver que rol y redigir segun
import { getRolesFromToken, hasRole, ROLES } from "@/lib";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const rawReturnTo = sp?.get("returnTo") || "";
  const msg = sp?.get("msg");
  const bannerMessage =
    msg === "login_required"
      ? "Tienes que iniciar sesión primero."
      : msg === "session_expired"
      ? "Sesion Expirada."
      : msg
      ? "Error inesperado."
      : null;
  const [form, setForm] = useState({
    correo: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirección automática si ya hay token
  useEffect(() => {
    const hasToken = Cookies.get("token") ? true : false;
    if (hasToken) {
      try {
        const decodedReturn = rawReturnTo
          ? decodeURIComponent(rawReturnTo)
          : "";
        const safeReturnTo =
          decodedReturn && decodedReturn.startsWith("/") ? decodedReturn : "";
        const finalRedirect =
          safeReturnTo ||
          (hasRole(ROLES.ADMIN)
            ? "/admin/publications"
            : "/offers");
          
        router.replace(finalRedirect);
      } catch (e) {
        router.replace("/offers");
      }
    }
  }, [router, rawReturnTo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || success) return;

    setError(null);
    setLoading(true);

    const payload: LoginRequestDto = {
      Email: form.correo,
      Password: form.password,
      RememberMe: form.rememberMe,
    };

    try {
      const response = await login(payload);

      // Log de respuesta del login para depuración
      // eslint-disable-next-line no-console
      console.log("[login] response:", response);

      if (!response.token) {
        setError(
          response.message || "Usuario no registrado o contraseña incorrecta."
        );
        setLoading(false);
        return;
      }

      // Guardar JWT en cookies
      Cookies.set("token", response.token, {
        expires: form.rememberMe ? 7 : undefined,
      });

      // Decodificar role desde el JWT para redirección por rol
      let roles: string[] | null = null;
      try {
        if (response.token) {
          roles = getRolesFromToken()
        }
      } catch (e) {
        // no bloquear si falla el decode
        // eslint-disable-next-line no-console
        console.warn("No se pudo decodificar el token para extraer role", e);
      }

      // Determinar ruta segura a la que redirigir
      const decodedReturn = rawReturnTo ? decodeURIComponent(rawReturnTo) : "";
      const safeReturnTo =
        decodedReturn && decodedReturn.startsWith("/") ? decodedReturn : "";

      // Si se proporcionó un returnTo válido lo usamos, si no elegimos según role
      let finalRedirect =
        safeReturnTo ||
        (hasRole(ROLES.ADMIN) ? "/admin/publications" : "/offers");

      console.log(response.message || "Inicio de sesión exitoso.");
      setSuccess(true);
      router.replace(finalRedirect);
    } catch (error: any) {
      console.error("Error en el login:", error);

      if (error.response.status === 403) {
        const email = form.correo;
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(
            email
          )}`
        );
        return;
      }

      const backendError = error?.response?.data;

      const errorMessage =
        backendError?.details ||
        "Credenciales inválidas. Por favor, revisa tu correo y contraseña.";

      setError(errorMessage);
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen h-full flex items-center justify-center bg-[#0d8ef2] px-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-[360px] flex flex-col items-center relative">
        {/* Logo */}
        <div className="absolute -top-10 flex flex-col items-center">
          <img
            src="/feucn_logo.png"
            alt="Logo FEUCN"
            className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
          />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-semibold text-white mt-16 mb-6">
          Inicio de Sesión
        </h2>
        {/* Banner de aviso */}
        {bannerMessage && (
          <div className="w-full mb-4 rounded-xl border border-blue-300 bg-blue-50/90 text-blue-800 px-3 py-2 text-sm">
            {bannerMessage}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm text-white mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm text-white">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="accent-blue-500"
              />
              Recordarme
            </label>

            <a href="/auth/reset-password" className="hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {error && (
            <p className="text-red-200 text-sm text-center mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f2937] text-white py-2 rounded-md hover:bg-[#374151] transition duration-200 disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-sm text-white mt-4">
          ¿No tienes una cuenta?{" "}
          <a href="/auth/register" className="underline hover:text-gray-200">
            Crea una aquí
          </a>
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-6 px-4 py-2 bg-transparent border border-white text-white rounded-md hover:bg-white hover:text-[#0d8ef2] transition"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
