import { Skeleton } from "@/components/ui/skeleton";

export function ValidationCardLoading() {
    return (
        <div className="flex flex-col h-full rounded-[2rem] bg-white shadow-xl overflow-hidden p-6 space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex-1" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
    );
}