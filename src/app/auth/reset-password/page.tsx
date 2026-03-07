"use client";

import { useState } from "react";
import { sendCode, verifyResetCode, resendCode } from "@/services/authService";
import type { ResetPasswordDto, VerifyResetCodeDto } from "@/services/dtos/authDto";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [Email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const payload: ResetPasswordDto = { Email };

    try {
      const res = await sendCode(payload);
      setMessage(res.message);
      setStep(2);
    } catch (err: any) {
      console.error("Error al enviar código:", err.response?.data?.details);
      setError("No se pudo enviar el código. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const payload: VerifyResetCodeDto = {
      Email,
      verificationCode,
      password,
    };

    try {
      const res = await verifyResetCode(payload);
      setMessage(res.message || "Contraseña cambiada correctamente.");
      setStep(1);
      setEmail("");
      setVerificationCode("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error al verificar código:", err);
      setError("El código es incorrecto o ha expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setMessage(null);
    setError(null);
    setLoading(true);

    const payload: ResetPasswordDto = { Email };

    try {
      const res = await resendCode(payload);
      setMessage(res.message);
    } catch (err: any) {
      console.error("Error al reenviar código:", err);
      setError("No se pudo reenviar el código.");
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
          {step === 1 ? "Restablecer Contraseña" : "Verificar Código"}
        </h2>

        {message && (
          <div className="bg-green-100 text-green-800 p-2 rounded mb-4 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              type="email"
              placeholder="email@example.com"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-900 transition-colors disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <input
              type="text"
              placeholder="******"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              pattern="\d{6}"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-900 transition-colors disabled:opacity-60"
            >
              {loading ? "Verificando..." : "Verificar y cambiar"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="mt-4 text-center">
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-blue-700 hover:underline text-sm"
            >
              Reenviar código
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-500 hover:underline text-sm">
            ← Volver
          </a>
        </div>
      </div>
    </div>
  );
}
