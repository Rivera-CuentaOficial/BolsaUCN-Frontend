"use client";

import { CVUpload } from "@/components/profile/CVUpload";
import { FileText } from "lucide-react";

interface CVUploadSectionProps {
    currentCV?: string;
    onUploadSuccess: (url: string | undefined) => void;
}

export function CVUploadSection({ currentCV, onUploadSuccess }: CVUploadSectionProps) {
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
                    currentCVUrl={currentCV} 
                    onUploadSuccess={onUploadSuccess}
                />
            </div>
        </div>
    );
}