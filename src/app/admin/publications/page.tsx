"use client";

import React from 'react';
import { CheckCircle, Settings, UserCog, Sparkles } from 'lucide-react';

const Footer = () => (
  // CORRECCIÓN 1: Agregamos 'text-slate-600' para forzar texto oscuro en todo el footer
  <footer className="border-t border-(--border) bg-white py-6 px-6 mt-auto relative z-10 text-slate-600">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-4">
      
      <div>
        {/* CORRECCIÓN 2: Forzamos color oscuro en los títulos */}
        <h4 className="font-bold text-slate-900 mb-2">FEUCN</h4>
        <div className="flex gap-3 text-xl text-slate-500">
          <a href="#" aria-label="Facebook" className="hover:text-slate-800 transition-colors"><i className="ri-facebook-fill" /></a>
          <a href="#" aria-label="LinkedIn" className="hover:text-slate-800 transition-colors"><i className="ri-linkedin-fill" /></a>
          <a href="#" aria-label="YouTube" className="hover:text-slate-800 transition-colors"><i className="ri-youtube-fill" /></a>
          <a href="#" aria-label="Instagram" className="hover:text-slate-800 transition-colors"><i className="ri-instagram-fill" /></a>
        </div>
      </div>

      <div>
        <h5 className="font-semibold text-slate-900 mb-1">Navegación</h5>
        <ul className="space-y-0.5 text-sm">
          {/* CORRECCIÓN 3: Aseguramos que los links tengan color y hover oscuro */}
          <li><a href="/admin/publications" className="hover:text-slate-900 hover:underline">Inicio</a></li>
          <li><a href="/admin/publications/validate" className="hover:text-slate-900 hover:underline">Validar</a></li>
          <li><a href="/admin/publications/manage" className="hover:text-slate-900 hover:underline">Administrar</a></li>
          <li><a href="/offerer/create-publication" className="hover:text-slate-900 hover:underline">Publicar</a></li>
        </ul>
      </div>

      <div>
        <h5 className="font-semibold text-slate-900 mb-1">Ayuda</h5>
        <ul className="space-y-0.5 text-sm">
          <li><a href="/faq" className="hover:text-slate-900 hover:underline">Preguntas frecuentes</a></li>
          <li><a href="/contact" className="hover:text-slate-900 hover:underline">Contacto</a></li>
          <li><a href="/support" className="hover:text-slate-900 hover:underline">Soporte</a></li>
        </ul>
      </div>

      <div>
        <h5 className="font-semibold text-slate-900 mb-1">Nosotros</h5>
        <ul className="space-y-0.5 text-sm">
          <li><a href="/about" className="hover:text-slate-900 hover:underline">Misión</a></li>
          <li><a href="/team" className="hover:text-slate-900 hover:underline">Equipo</a></li>
          <li><a href="https://www.instagram.com/feucn" className="hover:text-slate-900 hover:underline">Federación UCN</a></li>
        </ul>
      </div>

    </div>
  </footer>
);

export default function Page() {
  return (
    // Contenedor principal con texto blanco para la zona morada
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

      {/* Contenido del Panel */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10 min-h-[80vh]">
        
        <div className="relative text-center max-w-4xl space-y-8 flex flex-col items-center mb-12">
            
            <div className="relative mb-2 group">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-500 scale-150 opacity-50" />
                <img
                    src="/feucn_logo.png"
                    alt="Logo FEUCN"
                    className="relative mx-auto w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-2xl border-4 border-white/10 rounded-full"
                />
            </div>

            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-200 text-sm font-bold uppercase tracking-wider shadow-lg">
                    <Sparkles className="w-4 h-4 text-yellow-300" /> Sistema de Gestión
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-2xl">
                    Panel de Administración
                </h1>

                <p className="text-xl md:text-2xl text-purple-100/90 drop-shadow-md max-w-2xl mx-auto font-medium">
                    Gestión integral de las publicaciones del sistema BolsaFEUCN
                </p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-4xl px-4">
            <a
                href='/admin/publications/validate'
                className="group flex-1 flex items-center justify-center px-8 py-6 rounded-[2rem] text-lg font-bold transition-all duration-300 shadow-xl
                            bg-white/10 backdrop-blur-md border border-white/20 text-white 
                            hover:bg-white hover:text-purple-900 hover:scale-[1.02] hover:shadow-2xl hover:border-white"
            >
                <div className="mr-4 p-2 bg-white/10 rounded-full group-hover:bg-purple-100 transition-colors">
                    <CheckCircle className="size-6 text-white group-hover:text-purple-700" />
                </div>
                Validar Publicaciones
            </a>

            <a
                href='/admin/publications/manage'
                className="group flex-1 flex items-center justify-center px-8 py-6 rounded-[2rem] text-lg font-bold transition-all duration-300 shadow-xl
                            bg-white/10 backdrop-blur-md border border-white/20 text-white 
                            hover:bg-white hover:text-purple-900 hover:scale-[1.02] hover:shadow-2xl hover:border-white"
            >
                <div className="mr-4 p-2 bg-white/10 rounded-full group-hover:bg-purple-100 transition-colors">
                    <Settings className="size-6 text-white group-hover:text-purple-700" />
                </div>
                Administrar Publicaciones
            </a>

            <a
                href='/admin/users'
                className="group flex-1 flex items-center justify-center px-8 py-6 rounded-[2rem] text-lg font-bold transition-all duration-300 shadow-xl
                            bg-white/10 backdrop-blur-md border border-white/20 text-white 
                            hover:bg-white hover:text-purple-900 hover:scale-[1.02] hover:shadow-2xl hover:border-white"
            >
                <div className="mr-4 p-2 bg-white/10 rounded-full group-hover:bg-purple-100 transition-colors">
                    <UserCog className="size-6 text-white group-hover:text-purple-700" />
                </div>
                Ver Usuarios
            </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}