import { UserDetailView } from "@/views/app/admin/users/[id]";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <UserDetailView id={id} />;
}