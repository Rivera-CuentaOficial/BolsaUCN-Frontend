"use client";

import ChangePassword from "@/components/profile/ChangePassword";

interface ChangePasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
    const handleSuccess = () => {
        // Success notification will be handled by the existing ChangePassword component
        onClose();
    };

    return (
        <ChangePassword 
            open={isOpen} 
            onOpenChange={onClose} 
            onSuccess={handleSuccess}
        />
    );
}