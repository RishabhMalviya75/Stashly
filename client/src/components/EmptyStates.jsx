/**
 * EmptyStates Component
 * =====================
 * Beautiful empty state illustrations for different scenarios
 */

import { Bookmark, MessageSquare, Code, FileText, StickyNote, Search, Star, FolderOpen, Plus } from 'lucide-react';

// Empty state configurations
const EMPTY_STATES = {
    noResources: {
        icon: FolderOpen,
        title: "No resources yet",
        description: "Start organizing your digital life. Add your first bookmark, code snippet, or note.",
        action: "Add Resource"
    },
    noFavorites: {
        icon: Star,
        title: "No favorites yet",
        description: "Star resources you want quick access to. They'll appear here.",
        action: null
    },
    noSearchResults: {
        icon: Search,
        title: "No results found",
        description: "Try different keywords or check your spelling.",
        action: null
    },
    noFolderResources: {
        icon: FolderOpen,
        title: "This folder is empty",
        description: "Move resources here or create new ones in this folder.",
        action: "Add Resource"
    },
    noBookmarks: {
        icon: Bookmark,
        title: "No bookmarks yet",
        description: "Save interesting websites and articles for later.",
        action: "Add Bookmark"
    },
    noPrompts: {
        icon: MessageSquare,
        title: "No AI prompts yet",
        description: "Store your favorite prompts for ChatGPT, Claude, and more.",
        action: "Add Prompt"
    },
    noSnippets: {
        icon: Code,
        title: "No code snippets yet",
        description: "Save useful code patterns and reusable components.",
        action: "Add Snippet"
    },
    noDocuments: {
        icon: FileText,
        title: "No documents yet",
        description: "Keep links to important documents organized.",
        action: "Add Document"
    },
    noNotes: {
        icon: StickyNote,
        title: "No notes yet",
        description: "Capture quick thoughts and ideas.",
        action: "Add Note"
    }
};

export default function EmptyState({
    type = 'noResources',
    customTitle,
    customDescription,
    onAction
}) {
    const config = EMPTY_STATES[type] || EMPTY_STATES.noResources;
    const Icon = config.icon;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
            {/* Icon with gradient background */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-full blur-xl opacity-60" />
                <div className="relative p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl shadow-soft">
                    <Icon className="w-12 h-12 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                {customTitle || config.title}
            </h3>

            {/* Description */}
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
                {customDescription || config.description}
            </p>

            {/* Action Button */}
            {config.action && onAction && (
                <button
                    onClick={onAction}
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {config.action}
                </button>
            )}
        </div>
    );
}

// Skeleton loading component for resource cards
export function ResourceCardSkeleton() {
    return (
        <div className="card p-4 animate-pulse">
            <div className="flex items-start gap-3">
                {/* Icon skeleton */}
                <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />

                <div className="flex-1 min-w-0">
                    {/* Title skeleton */}
                    <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />

                    {/* Description skeleton */}
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-2" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                </div>
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-2 mt-4">
                <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                <div className="h-5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            </div>
        </div>
    );
}

// Grid of skeleton cards for loading state
export function ResourceListSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ResourceCardSkeleton key={i} />
            ))}
        </div>
    );
}
