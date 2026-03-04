import { Suspense } from "react";
import { AdminUsersView } from '@/views/app/admin/users';

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div className="p-4">Cargando usuarios...</div>}>
            <AdminUsersView />
        </Suspense>
    );
}