import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />
    );
};

export const ProductSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-gray-50 dark:border-gray-800 space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </div>
    );
};

export const BannerSkeleton: React.FC = () => {
    return (
        <div className="w-full h-48 sm:h-64 rounded-[2rem] overflow-hidden">
            <Skeleton className="w-full h-full" />
        </div>
    );
};
