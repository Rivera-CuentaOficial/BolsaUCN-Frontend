"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDisclaimerAcceptance } from "@/hooks/common/use-disclaimer-acceptance";
import { DisclaimerModal } from "@/components/shared/DisclaimerModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

export default function RegisterPage() {
  const router = useRouter();
  const { accepted, manageDisclaimer } = useDisclaimerAcceptance();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = (selectedRoute: string) => {
    manageDisclaimer(true);
    setShowModal(false);
    setIsLoading(true);
    router.push(selectedRoute);
  };

  const handleDecline = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDecline = () => {
    manageDisclaimer(false);
    setShowConfirmation(false);
    router.push("/");
  };

  const handleCancelDecline = () => {
    setShowConfirmation(false);
  };

  const roles = [
    {
      id: "student",
      title: "Estudiante",
      desc: "Regístrate como estudiante UCN",
    },
    {
      id: "individual",
      title: "Oferente Particular",
      desc: "Publica tus servicios o trabajos personales",
    },
    {
      id: "company",
      title: "Empresa",
      desc: "Crea una cuenta para publicar oportunidades laborales",
    },
  ];

  return (
    <>
      <DisclaimerModal
        isOpen={showModal}
        isChecked={accepted}
        onCheckChange={(checked) => {
          manageDisclaimer(checked);
        }}
        onAccept={() => handleAccept(selectedRoute!)}
        onReject={handleDecline}
      />
      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Confirmar rechazo"
        message="¿Estás seguro de que deseas rechazar las normas? Serás redirigido a la página de inicio."
        confirmText="Sí, rechazar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleConfirmDecline}
        onCancel={handleCancelDecline}
      />

      <div className="min-h-screen flex flex-col justify-center items-center 
      bg-ucn-blue text-center px-4">
        {/* Logo */}
        <div className="relative w-24 h-24 mb-4">
          <Image
            src="/feucn_logo.png"
            alt="Logo FEUCN"
            fill
            className="rounded-full object-cover border-4 border-white"
          />
        </div>

        {/* Tarjeta central */}
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-2">Selecciona tu tipo de cuenta</h1>
          <p className="text-gray-600 mb-6">
            Elige cómo deseas registrarte en BolsaUCN.
          </p>

          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRoute(`/auth/register/${role.id}`);
                  {accepted ? handleAccept(`/auth/register/${role.id}`) : setShowModal(true)}
                }}
                disabled={showModal || isLoading}
                className={`w-full py-3 px-4 rounded-xl border border-gray-300 
                font-medium transition ${
                  showModal || isLoading
                    ? "opacity-50 cursor-not-allowed bg-gray-100"
                    : "hover:bg-blue-50 cursor-pointer"
                }`}
              >
                {role.title}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-6">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/auth/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Inicia sesión aquí
            </a>
            .
          </p>
        </div>

        {/* Botón volver */}
        <button
          onClick={() => router.push("/")}
          disabled={showModal || isLoading}
          className={`mt-6 px-6 py-2 rounded-full border border-white text-white 
          transition ${
            showModal || isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-white hover:text-blue-600 cursor-pointer"
          }`}
        >
          ← Volver
        </button>
      </div>
    </>
  );
}
