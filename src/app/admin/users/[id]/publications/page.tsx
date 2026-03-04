import { UserPublicationsView } from "@/views/app/admin/users/[id]/publications";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPublicationsPage({ params }: PageProps) {
  const { id } = await params;
  
  return <UserPublicationsView userId={id} />;
}
