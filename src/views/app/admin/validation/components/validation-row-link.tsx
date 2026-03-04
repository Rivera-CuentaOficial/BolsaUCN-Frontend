import React from 'react';
import Link from 'next/link';
import { getOfferTypeDisplay } from '@/lib';
import { AdminItemBase } from '@/models/responses';
import { ArrowRight, Briefcase, Heart, ShoppingBag } from 'lucide-react';

interface ValidationRowLinkProps {
    itemId: string;
    item: AdminItemBase;
}

const getIcon = (type: string) => {
    if (type === "Oferta") return Briefcase;
    if (type === "CompraVenta") return ShoppingBag;
    return Heart;
}

const getTypeColor = (type: string) => {
    if (type === "Oferta") return "bg-blue-100 text-blue-700";
    if (type === "CompraVenta") return "bg-purple-100 text-purple-700";
    return "bg-indigo-100 text-indigo-700";
}

export function ValidationRowLink({ itemId, item }: ValidationRowLinkProps) {
    if (!item) return null;

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

                {/* Publication Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate mb-1">{item.title}</h3>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getTypeColor(item.type)}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {text}
                    </span>
                </div>
            </div>

            {/* Right Section - Action Button */}
            <div className="hidden md:flex items-center gap-4">
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