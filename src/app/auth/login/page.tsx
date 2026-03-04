"use client";

import { Suspense } from "react";
import { LoginForm } from "@/views/app/auth/login";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="min-h-screen h-full flex items-center justify-center bg-ucn-blue px-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-[360px] flex flex-col items-center relative">
        <div className="absolute -top-10 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white/20 animate-pulse" />
        </div>
        <div className="mt-16 mb-6 h-8 w-48 bg-white/20 rounded animate-pulse" />
        <div className="w-full space-y-4">
          <div className="h-10 bg-white/20 rounded animate-pulse" />
          <div className="h-10 bg-white/20 rounded animate-pulse" />
          <div className="h-10 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}