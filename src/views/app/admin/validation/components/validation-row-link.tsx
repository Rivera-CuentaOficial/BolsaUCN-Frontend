import React from 'react';
import Link from 'next/link';
import { getOfferTypeDisplay } from '@/lib'; 
import { AdminItemBase } from '@/models/responses'; 
import { ArrowRight, Briefcase, Heart, ShoppingBag, Calendar } from 'lucide-react';

interface ValidationRowLinkProps {
    itemId: string;
    item: AdminItemBase;
}

const getIcon = (type: string) => {
    if (type === "Voluntariado") return Heart;
    if (type === "Compra/Venta") return ShoppingBag;
    return Briefcase;
}

const getTypeColor = (type: string) => {
    if (type === "Voluntariado") return "bg-pink-100 text-pink-700";
    if (type === "Compra/Venta") return "bg-purple-100 text-purple-700";
    return "bg-indigo-100 text-indigo-700";
}

export function ValidationRowLink({ itemId, item }: ValidationRowLinkProps) {
    const { text } = getOfferTypeDisplay(item.type);
    const detailUrl = `/admin/publications/validate/${itemId}`;
    const Icon = getIcon(item.type);

    return (
        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/15 transition-all group">
            <Link href={detailUrl} className="absolute inset-0 z-0 rounded-2xl" />

            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Icon Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white shadow-lg">
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                
                {/* Publication Info with Badge */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-lg truncate">{item.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${getTypeColor(item.type)}`}>
                            {text}
                        </span>
                    </div>
                    <p className="text-sm text-white/70">Pendiente de revisión</p>
                </div>
            </div>

            {/* Right Section - Status & Action */}
            <div className="hidden md:flex items-center gap-4">
                {/* Status Card */}
                <div className="flex flex-col items-center px-4 py-2 bg-white/10 rounded-xl border border-white/20 w-[150px]">
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">Estado</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold text-white">Pendiente</span>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href={detailUrl}
                    className="relative z-30 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 w-[150px] justify-center"
                >
                    <span>Revisar</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

export default ValidationRowLink;