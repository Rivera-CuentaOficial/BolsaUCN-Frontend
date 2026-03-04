"use client";

import React from "react";
import { Button } from "@/components/ui/Button"; 

interface RegisterAdminButtonProps {
  className?: string;
}

export default function RegisterAdminButton({ className }: RegisterAdminButtonProps) {
  
  const handleClick = () => {
    window.location.href = "/auth/register/admin";
  };
  
  const customStyles = 
    "w-full text-xs font-medium " +
    "text-white " +
    "bg-purple-800 hover:bg-purple-900 " + // Morado oscuro
    "dark:bg-purple-700 dark:hover:bg-purple-800 " +
    "transition-colors duration-200";

  return (
    <Button
      type="button"
      className={`${customStyles} ${className}`}
      onClick={handleClick}
    >
      Registrar nuevo admin
    </Button>
  );
}