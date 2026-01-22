/**
 * ResourceList Component
 * ======================
 * Displays a grid/list of resources with empty and loading states.
 */

import { Folder } from 'lucide-react';
import ResourceCard from './ResourceCard';

export default function ResourceList({
    resources,
    isLoading,
    onFavorite,
    onDelete,
    onEdit,
    onClick,
    emptyMessage = 'No resources found'
}) {
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="card animate-pulse">
                        <div className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                                <div className="flex-1">
                                    <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded" />
                                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty state
    if (!resources || resources.length === 0) {
        return (
            <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                    {emptyMessage}
                </p>
            </div>
        );
    }

    // Resource grid
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(resource => (
                <ResourceCard
                    key={resource._id}
                    resource={resource}
                    onFavorite={onFavorite}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onClick={onClick}
                />
            ))}
        </div>
    );
}
