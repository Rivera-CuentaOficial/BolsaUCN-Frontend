export function ProfileSkeleton() {
    return (
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
            {/* Back button skeleton */}
            <div className="h-10 w-24 bg-white/10 rounded-full mb-6" />
            
            {/* Header skeleton */}
            <div className="mb-8 space-y-4">
                <div className="h-6 w-32 bg-white/20 rounded-full" />
                <div className="h-12 bg-white/20 rounded-lg w-64" />
                <div className="h-6 bg-white/20 rounded w-48" />
            </div>

            {/* Content card skeleton */}
            <div className="bg-white rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-3/4 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                        ))}
                    </div>
                    <div className="w-full md:w-1/4">
                        <div className="bg-slate-100 h-64 rounded-3xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}