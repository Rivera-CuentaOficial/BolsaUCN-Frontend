"use client";

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/lib'; 
import { PublicationDetailsForApprovalDTO } from '@/models/responses';
import { useEffect, useState } from 'react';
import { validationService } from '@/services/validationService';

export function usePublicationDetailsForApproval(id: string){
    const [details, setDetails] = useState<PublicationDetailsForApprovalDTO | null>(null);
    const [isMutating, setIsMutating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await validationService.getPublicationDetailsForApproval(id);
            if (response.data) {
                setDetails(response.data.data);
            }
        } catch (error: any) {
            setError(error.response?.data?.details || "Error al obtener los detalles de la publicación");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const handleRetry = () => {
        fetchDetails();
    };

    const handleAction = async (action: 'publish' | 'reject', rejectionReason?: string) => {
        const publicationId = details?.publicationId;
        if (!publicationId) {
            toast.error("ID de publicación no válido.");
            return;
        }
        try {
            setIsMutating(true);
            await validationService.validatePublication(publicationId, action, rejectionReason);
            toast.success(`Publicación ${action === 'publish' ? 'publicada' : 'rechazada'} con éxito.`);
        } catch (error: any) {
            throw error;
        } finally {
            setIsMutating(false);
        }
    }

    return {
        details,
        isLoading,
        error,
        handleRetry,
        handleAction,
        isMutating
    };
}