import React from 'react';
import Link from 'next/link';
import { AdminItemBase } from '@/models/responses';
import { Briefcase, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { getOfferTypeDisplay } from '@/lib';

interface ValidationCardProps {
    itemId: string;
    item: AdminItemBase;
}

const getIcon = (type: string) => {
    if (type === "Voluntariado") return Heart;
    if (type === "Compra/Venta") return ShoppingBag;
    return Briefcase;
};

const getTypeColor = (type: string) => {
    if (type === "Voluntariado") return "bg-pink-100 text-pink-700";
    if (type === "Compra/Venta") return "bg-purple-100 text-purple-700";
    return "bg-indigo-100 text-indigo-700";
};

export function ValidationCard({ itemId, item }: ValidationCardProps) {
    const { text } = getOfferTypeDisplay(item.type);
    const detailUrl = `/admin/publications/validate/${itemId}`;
    const Icon = getIcon(item.type);

    return (
        <article className="relative flex flex-col h-full rounded-[2rem] bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group border-4 border-transparent hover:border-pink-200 overflow-hidden">
            <Link href={detailUrl} className="absolute inset-0 z-0 rounded-2xl" />

            {/* Content */}
            <div className="px-6 py-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all line-clamp-3">
                    {item.title}
                </h3>

                <div className="mt-auto pt-4">
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase tracking-wider ${getTypeColor(item.type)}`}>
                        <Icon className="w-4 h-4" />
                        {text}
                    </span>
                </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10 p-4 mt-2">
                <div className="w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
                    <span>Ver detalles</span>
                    <ArrowRight className="w-5 h-5" />
                </div>
            </div>
        </article>
    );
}