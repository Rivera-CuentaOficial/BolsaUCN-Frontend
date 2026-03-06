"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail, resendVerification } from "@/services/authService";
import type { VerifyEmailDto, ResendVerificationDto } from "@/services/dtos/authDto";
import { toast } from "sonner";

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [form, setForm] = useState({
    email: emailFromQuery,
    VerificationCode: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromQuery) {
      setForm((prev) => ({ ...prev, email: emailFromQuery }));
    }
  }, [emailFromQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: VerifyEmailDto = {
      Email: form.email,
      VerificationCode: form.VerificationCode,
    };

    try {
      const result = await verifyEmail(payload);
      toast.success(
        result.message ||
        "Correo verificado correctamente."
      );
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(form.email)}`);
      }, 2000);
      
    } catch (err) {
      console.error("Error verificando el correo:", err);
      toast.error(
        "Error verificando el correo. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);

    const payload: ResendVerificationDto = {
      Email: form.email,
    };

    try {
      const result = await resendVerification(payload);
      toast.success(
        result.message || "Codigo reenviado correctamente."
      );
    } catch (err) {
      console.error("Error reenviando el codigo:", err);
      toast.error(
        "No se pudo reenviar el codigo. Intenta mas tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-ucn-blue px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-8">
        <div className="flex justify-center mb-6">
          <img
            src="/feucn_logo.png"
            alt="Logo FEUCN"
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
        </div>

        <h2 className="text-center text-xl font-semibold mb-6">
          Verificar Correo
        </h2>

        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <input
              type="text"
              name="VerificationCode"
              placeholder="******"
              value={form.VerificationCode}
              onChange={handleChange}
              required
              pattern="\d{6}"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-900 transition-colors disabled:opacity-60"
          >
            {loading ? "Verificando..." : "Verificar correo"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-blue-700 hover:underline text-sm"
          >
            Reenviar codigo
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-500 hover:underline text-sm">
            ← Volver
          </a>
        </div>
      </div>
    </div>
  );
}