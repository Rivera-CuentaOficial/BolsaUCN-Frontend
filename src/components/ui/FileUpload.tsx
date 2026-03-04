"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FileUpload({
  accept = ".pdf",
  maxSizeMB = 10,
  onFileSelect,
  onError,
  disabled = false,
  className,
  children,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const isValidType = acceptedTypes.some(
        (type) =>
          type === fileExtension ||
          type === file.type ||
          (type.endsWith("/*") && file.type.startsWith(type.replace("/*", "")))
      );

      if (!isValidType) {
        return `Tipo de archivo no permitido. Usa: ${accept}`;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        return `El archivo supera el límite de ${maxSizeMB}MB`;
      }

      return null;
    },
    [accept, maxSizeBytes, maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        onError?.(error);
        return;
      }

      setFileName(file.name);
      onFileSelect(file);
    },
    [validateFile, onFileSelect, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {children || (
        <>
          <svg
            className="w-10 h-10 mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {fileName ? (
            <p className="text-sm text-green-600 font-medium">{fileName}</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">
                  Haz clic para subir
                </span>{" "}
                o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {accept.toUpperCase().replace(/\./g, "")} (máx. {maxSizeMB}MB)
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}