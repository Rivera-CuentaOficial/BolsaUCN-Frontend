 import { getServerSession } from 'next-auth';
 import { redirect } from 'next/navigation';
 import { authConfig } from '@/auth.config';
 import { cookies } from 'next/headers';
 import { ApplicantView } from '@/views/app/landing/applicant';
 
 /**
  * Vista de Menú Principal (Dashboard) para el Postulante.
  * Permite navegar a las distintas funcionalidades:  Explorar ofertas, Ver mis postulaciones, Ver mi Perfil.
  */

 export default async function ApplicantPage() {
   // Verificación de sesión (NextAuth o Cookie Token)
   const session = await getServerSession(authConfig as any);
   const cookieStore: any = await cookies();
   const tokenCookie = cookieStore.get?.("token")?.value;

   if (!session && !tokenCookie) {
     const returnTo = encodeURIComponent('/landing/applicant');
     const msg = encodeURIComponent('Debes iniciar sesión para acceder al panel.');
     redirect(`/auth/login?returnTo=${returnTo}&msg=${msg}`);
   }
 
   return <ApplicantView />;
 }