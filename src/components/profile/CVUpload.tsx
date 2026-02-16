"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { cvService } from "@/services/cvService";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { FileText, Upload, AlertCircle, Trash2, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { NotificationType } from "@/hooks/common/use-notification";

interface CVUploadProps {
  hasCV: boolean;
  onUploadSuccess?: (url: string) => void;
  showNotification?: (title: string, message: string, type?: NotificationType) => void;
}

export function CVUpload({ hasCV, onUploadSuccess, showNotification }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasCVState, setHasCVState] = useState<boolean>(hasCV);

  const handleDownloadCV = async () => {
    if (!hasCVState) {
      toast.error("No hay CV disponible para descargar");
      return;
    }

    setLoading(true);
    await cvService.downloadCV();
    setLoading(false);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Selecciona un archivo primero");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await cvService.uploadCV(file);

      if (response.data) {
        toast.success("CV subido exitosamente");
        setHasCVState(true);
        onUploadSuccess?.(response.data);
        setFile(null);
      } else {
        setError(response.message || "Error al subir el CV");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.details || "Error al subir el archivo";
      
      // Check if it's the pending applications error
      if (errorMessage.includes("postulaciones pendientes")) {
        if (showNotification) {
          showNotification(
            "No se puede actualizar el CV",
            "No puedes actualizar tu CV porque tienes postulaciones pendientes que requieren un CV. Por favor, espera a que se procesen tus postulaciones antes de actualizar tu currículum.",
            "error"
          );
        } else {
          toast.error(errorMessage);
        }
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!hasCVState) return;

    setLoading(true);
    setShowDeleteDialog(false);

    try {
      const response = await cvService.deleteCV();

      if (response.data !== null) {
        toast.success("CV eliminado exitosamente");
        setHasCVState(false);
        onUploadSuccess?.("");
      } else {
        setError(response.message || "Error al eliminar el CV");
        toast.error(response.message || "Error al eliminar el CV");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.details || "Error al eliminar el archivo";
      
      // Check if it's the pending applications error
      if (errorMessage.includes("postulaciones pendientes")) {
        if (showNotification) {
          showNotification(
            "No se puede eliminar el CV",
            "No puedes eliminar tu CV porque tienes postulaciones pendientes que requieren un CV. Por favor, espera a que se procesen tus postulaciones antes de eliminar tu currículum.",
            "error"
          );
        } else {
          toast.error(errorMessage);
        }
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* CV Restriction Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">
            Restricción: CV de una sola página
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Solo se permiten CVs de una página en formato PDF. Asegúrate de que tu documento cumpla con este requisito antes de subirlo.
          </p>
        </div>
      </div>

      {/* Current CV Display - Use hasCV from endpoint, not prop */}
      {hasCVState ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">CV cargado</p>
                <p className="text-xs text-green-600">Tu currículum está disponible para los reclutadores</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadCV}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Download className="w-4 h-4" />
                Descargar
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            </div>
          </div>

          {/* Optional: Replace CV section */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-900 font-medium list-none flex items-center gap-2">
              <span className="inline-block transition-transform group-open:rotate-90">▶</span>
              Reemplazar CV
            </summary>
            <div className="mt-3 pl-5 space-y-3">
              <FileUpload
                accept=".pdf,application/pdf"
                maxSizeMB={10}
                onFileSelect={handleFileSelect}
                onError={setError}
                disabled={loading}
              />
              
              {file && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">{file.name}</p>
                      <p className="text-xs text-blue-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-slate-500 hover:text-slate-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {file && (
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading ? "Subiendo..." : "Reemplazar CV"}
                </Button>
              )}
            </div>
          </details>
        </div>
      ) : (
        /* No CV - Upload Interface */
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <FileText className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">
                No tienes CV cargado
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Sube tu currículum para que los reclutadores puedan conocer tu perfil profesional.
              </p>
            </div>
          </div>

          <FileUpload
            accept=".pdf,application/pdf"
            maxSizeMB={10}
            onFileSelect={handleFileSelect}
            onError={setError}
            disabled={loading}
          />

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Selected File Preview */}
          {file && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-700">{file.name}</p>
                  <p className="text-xs text-blue-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-slate-500 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload Button */}
          {file && (
            <Button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {loading ? "Subiendo..." : "Subir CV"}
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar CV?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu currículum será eliminado permanentemente y los reclutadores ya no podrán verlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}