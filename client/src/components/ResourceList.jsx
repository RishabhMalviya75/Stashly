/**
 * ResourceList Component
 * ======================
 * Displays a grid/list of resources with empty and loading states.
 */

import ResourceCard from './ResourceCard';
import EmptyState, { ResourceListSkeleton } from './EmptyStates';

export default function ResourceList({
    resources,
    isLoading,
    onFavorite,
    onDelete,
    onEdit,
    onClick,
    onAdd,
    emptyType = 'noResources',
    emptyMessage
}) {
    // Loading skeleton
    if (isLoading) {
        return <ResourceListSkeleton count={6} />;
    }

    // Empty state
    if (!resources || resources.length === 0) {
        return (
            <EmptyState
                type={emptyType}
                customDescription={emptyMessage}
                onAction={onAdd}
            />
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

