
 "use client"
 import { useRouter } from 'next/navigation';
 import { 
     Plus, 
     LayoutList, 
     User, 
     LogOut, 
     LayoutDashboard
 } from "lucide-react";
 
 /**
  * Vista de Menú Principal (Dashboard) para el Oferente.
  * Permite navegar a las distintas funcionalidades: Crear publicación, Ver mis publicaciones, Perfil.
  */
 export default function OffererView() {
   const router = useRouter();
 
   const menuItems = [
     {
       title: "Crear Publicación",
       description: "Publica una nueva oferta laboral o venta de artículo.",
       icon: <Plus className="w-8 h-8" />,
       onClick: () => router.push('/offerer/create-publication'), 
       color: "from-emerald-400 to-teal-500",
       bgHover: "hover:bg-emerald-500/10",
       border: "border-emerald-500/20"
     },
     {
       title: "Mis Publicaciones",
       description: "Revisa y gestiona el estado de tus publicaciones activas.",
       icon: <LayoutList className="w-8 h-8" />,
       onClick: () => router.push('/offerer/your-publications'),
       color: "from-blue-400 to-indigo-500",
       bgHover: "hover:bg-blue-500/10",
       border: "border-blue-500/20"
     },
     {
       title: "Mi Perfil",
       description: "Actualiza tu información personal y de contacto.",
       icon: <User className="w-8 h-8" />,
       onClick: () => router.push('/offerer/profile/company'),
       color: "from-purple-400 to-pink-500",
       bgHover: "hover:bg-purple-500/10",
       border: "border-purple-500/20"
     }
   ];
 
   return (
     <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">
 
         <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
             
             {/* Header */}
             <div className="text-center mb-16 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-200 text-xs font-bold uppercase tracking-wider shadow-lg mb-6">
                     <LayoutDashboard className="w-4 h-4" /> Panel de Control
                 </div>
                 <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-2xl mb-6 leading-tight">
                     Bienvenido, <br className="md:hidden" />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-200">Oferente</span>
                 </h1>
                 <p className="text-xl text-purple-100/80 font-medium max-w-2xl mx-auto">
                     Gestiona tus oportunidades laborales y ventas de artículos para la comunidad universitaria desde un solo lugar.
                 </p>
             </div>
 
             {/* Menu Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                 {menuItems.map((item, index) => (
                     <button
                         key={index}
                         onClick={item.onClick}
                         className={`
                             group relative flex flex-col items-start p-8 rounded-[2.5rem]
                             bg-white/5 backdrop-blur-md border ${item.border}
                             transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/20
                             ${item.bgHover} text-left animate-in fade-in slide-in-from-bottom-8
                         `}
                         style={{ animationDelay: `${index * 150}ms` }}
                     >
                         {/* Icon Container */}
                         <div className={`
                             mb-6 p-4 rounded-2xl bg-gradient-to-br ${item.color} 
                             shadow-lg group-hover:scale-110 transition-transform duration-300
                             text-white
                         `}>
                             {item.icon}
                         </div>
 
                         <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-white/90">
                             {item.title}
                         </h3>
                         <p className="text-purple-100/70 font-medium leading-relaxed">
                             {item.description}
                         </p>
 
                         {/* Arrow Decoration */}
                         <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                             <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                             </svg>
                         </div>
                     </button>
                 ))}
             </div>
 
             {/* Logout Button */}
             <div className="mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                 <button 
                     onClick={() => router.push('/auth/logout')}
                     className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-200 font-bold transition-all border border-red-500/20 hover:border-red-500/40 backdrop-blur-sm group"
                 >
                     <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                     Cerrar Sesión
                 </button>
             </div>
 
         </main>
     </div>
   );
 }