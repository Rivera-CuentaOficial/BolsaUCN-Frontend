import { Suspense } from "react";
import { VerifyEmailView } from "@/views/app/auth/verify-email";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailPageSkeleton />}>
      <VerifyEmailView />
    </Suspense>
  );
}

function VerifyEmailPageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-ucn-blue px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-8">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100 animate-pulse" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-6 animate-pulse" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-blue-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}