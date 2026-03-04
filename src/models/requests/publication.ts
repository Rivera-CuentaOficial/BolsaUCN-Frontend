export interface ValidationActionVariables {
    id: string;
    action: 'publish' | 'reject';
    rejectionReason?: string;
}

export interface ClosePublicationVariables {
    id: string;
    typePath: "buysells" | "offers";
}