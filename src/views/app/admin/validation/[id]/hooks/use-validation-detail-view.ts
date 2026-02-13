"use client";

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/lib'; 
import { UseAdminDetailValidateResult } from '@/models/responses';
import { 
    useGetAdminPublicationDetailQuery,
    useValidationActionMutation
} from '@/hooks/api/use-validation-service';

export function useAdminPublicationDetailView(id: string): UseAdminDetailValidateResult {
    const router = useRouter();
    
    const detailQuery = useGetAdminPublicationDetailQuery(id);
    const validationMutation = useValidationActionMutation();
    
    
    const isViewLoading = detailQuery.isLoading || (detailQuery.isFetching && !detailQuery.data);

    const handleAction = (action: 'publish' | 'reject', rejectionReason?: string) => {
        const publicationId = detailQuery.data?.id;
       
        if (!publicationId || validationMutation.isPending) {
            return Promise.reject( new Error('Acción no permitida en este momento.') );
        }
        return new Promise<void>((resolve, reject) => {
            validationMutation.mutate({ id: publicationId, action, rejectionReason }, {
                    onSuccess: () => {
                        resolve();
                    },
                    onError: (error) => {
                        reject(error);
                    },
                }
            );
        });
    };
    
    const handleRetry = () => {
        detailQuery.refetch();
    };
    
    const errorDetails = detailQuery.error
        ? (handleApiError(detailQuery.error).details || null) 
        : null;

    return {
    
        detail: isViewLoading ? null : (detailQuery.data || null),
        loading: isViewLoading,
        error: errorDetails,
        isMutating: validationMutation.isPending, 
        handleAction,
        handleRetry,
    };
}