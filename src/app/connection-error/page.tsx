import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function ConnectionErrorPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-(--chip) mb-6">
        <WifiOff className="w-10 h-10 text-(--primary)" strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl font-bold text-(--ink) mb-2">
        Sin conexión con el servidor
      </h1>

      <p className="text-(--muted-ink) max-w-md mb-8">
        No pudimos conectarnos al servidor. Verifica tu conexión a internet o
        intenta de nuevo en unos momentos.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-lg bg-(--primary) text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-lg border border-(--border) text-(--ink) font-medium hover:bg-(--chip) transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
