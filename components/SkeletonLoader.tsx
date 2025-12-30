import React from 'react';

export const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-app-card rounded-xl overflow-hidden border border-app-border animate-pulse">
            {/* Image Skeleton */}
            <div className="h-32 sm:h-48 bg-app-bg"></div>

            {/* Content Skeleton */}
            <div className="p-2.5 sm:p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-app-bg rounded w-3/4"></div>
                        <div className="h-3 bg-app-bg rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-16 bg-app-bg rounded"></div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 bg-app-bg rounded w-20"></div>
                        <div className="h-3 bg-app-bg rounded w-20"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-6 bg-app-bg rounded w-24"></div>
                        <div className="h-4 bg-app-bg rounded w-16"></div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-app-bg rounded"></div>
                    <div className="w-10 h-8 bg-app-bg rounded"></div>
                </div>
            </div>
        </div>
    );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-app-bg border-b border-app-border">
                        <tr>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <th key={i} className="p-5">
                                    <div className="h-3 bg-app-border rounded w-full animate-pulse"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="p-4">
                                    <div className="h-4 bg-app-bg rounded w-8"></div>
                                </td>
                                <td className="p-4">
                                    <div className="w-12 h-12 bg-app-bg rounded"></div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-app-bg rounded w-32"></div>
                                        <div className="h-3 bg-app-bg rounded w-24"></div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="h-6 bg-app-bg rounded w-16"></div>
                                </td>
                                <td className="p-4">
                                    <div className="h-4 bg-app-bg rounded w-20"></div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 bg-app-bg rounded"></div>
                                        <div className="h-8 w-8 bg-app-bg rounded"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const SkeletonDashboard: React.FC = () => {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 bg-app-card rounded w-48"></div>
                    <div className="h-4 bg-app-card rounded w-64"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 bg-app-card rounded"></div>
                    <div className="h-10 w-24 bg-app-card rounded"></div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-app-card border border-app-border rounded-2xl p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div className="h-12 w-12 bg-app-bg rounded-xl"></div>
                                <div className="h-6 w-16 bg-app-bg rounded-full"></div>
                            </div>
                            <div className="h-8 bg-app-bg rounded w-32"></div>
                            <div className="h-4 bg-app-bg rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-app-card border border-app-border rounded-2xl p-6">
                <div className="h-64 bg-app-bg rounded"></div>
            </div>
        </div>
    );
};
