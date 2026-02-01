import { Skeleton } from "@/components/ui/skeleton";

export function ValidationListLoading() {
    return (
        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl animate-pulse">
            <div className="flex items-center gap-4 flex-1">
                {/* Avatar Skeleton */}
                <Skeleton className="h-12 w-12 rounded-full bg-white/20 flex-shrink-0" />
                
                {/* Content Skeleton */}
                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-48 bg-white/20" />
                        <Skeleton className="h-5 w-20 bg-white/20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-32 bg-white/15" />
                </div>
            </div>
            
            {/* Right Section Skeleton - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
                <Skeleton className="h-16 w-[150px] rounded-xl bg-white/20" />
                <Skeleton className="h-12 w-[150px] rounded-2xl bg-white/20" />
            </div>
        </div>
    );
}