"use client";

import { CVUpload } from "@/components/profile/CVUpload";
import { FileText } from "lucide-react";
import type { NotificationType } from "@/hooks/common/use-notification";

interface CVUploadSectionProps {
    hasCV: boolean;
    onUploadSuccess: (url: string | undefined) => void;
    showNotification: (title: string, message: string, type?: NotificationType) => void;
}

export function CVUploadSection({ hasCV, onUploadSuccess, showNotification }: CVUploadSectionProps) {
    return (
        <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-900">
                    Currículum Vitae
                </h3>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <CVUpload 
                    hasCV={hasCV}
                    onUploadSuccess={onUploadSuccess}
                    showNotification={showNotification}
                />
            </div>
        </div>
    );
}