
 import { useRouter } from 'next/navigation';
 import { 
     Plus, 
     LayoutList, 
     User, 
     LogOut, 
     LayoutDashboard
 } from "lucide-react";
 import { getServerSession } from 'next-auth';
 import { redirect } from 'next/navigation';
 import { authConfig } from '@/auth.config';
 import { cookies } from 'next/headers';
 import { OfferorView } from '@/views/app/landing/offeror';
 
 /**
  * Vista de Menú Principal (Dashboard) para el Oferente.
  * Permite navegar a las distintas funcionalidades: Crear publicación, Ver mis publicaciones, Perfil.
  */

 export default async function OfferorPage() {
   // Verificación de sesión (NextAuth o Cookie Token)
   const session = await getServerSession(authConfig as any);
   const cookieStore: any = await cookies();
   const tokenCookie = cookieStore.get?.("token")?.value;

   if (!session && !tokenCookie) {
     const returnTo = encodeURIComponent('/landing/offeror');
     const msg = encodeURIComponent('Debes iniciar sesión para acceder al panel.');
     redirect(`/auth/login?returnTo=${returnTo}&msg=${msg}`);
   }
 
   return <OfferorView />;
 }