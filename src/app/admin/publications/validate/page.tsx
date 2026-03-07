import { Suspense } from "react";
import { ValidationView } from "@/views/app"; 
export const metadata = {
  title: "Validar Publicaciones",
  description: "Panel de revisión y aprobación de publicaciones pendientes.",
};

export default function ValidationPage() {
  return (
    <Suspense fallback={<ValidationPageSkeleton />}>
      <ValidationView />
    </Suspense>
  );
}

function ValidationPageSkeleton() {
  return (
    <div className="min-h-screen bg-ucn-blue px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/20 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}