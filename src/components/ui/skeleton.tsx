import * as React from "react"

/**
 * Skeleton Loader Bileşeni
 * Loading states için
 */
export function Skeleton({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-muted ${className}`}
            {...props}
        />
    )
}

/**
 * Ürün Kartı Skeleton
 */
export function ProductCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            <Skeleton className="aspect-square" />
            <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
            </div>
        </div>
    )
}

/**
 * Kategori Kartı Skeleton
 */
export function CategoryCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
        </div>
    )
}

/**
 * Tablo Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    )
}

/**
 * Sayfa Skeleton
 */
export function PageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-10 w-full" />
            <TableSkeleton />
        </div>
    )
}
