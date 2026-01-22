/**
 * ResourceCard Component
 * ======================
 * Displays a single resource with type-specific styling and actions.
 */

import {
    Bookmark,
    MessageSquare,
    Code,
    FileText,
    StickyNote,
    Star,
    Trash2,
    Edit,
    ExternalLink,
    Copy,
    MoreVertical,
    Folder
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Type configuration
const TYPE_CONFIG = {
    bookmark: { icon: Bookmark, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    prompt: { icon: MessageSquare, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
    snippet: { icon: Code, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    document: { icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
    note: { icon: StickyNote, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' }
};

export default function ResourceCard({ resource, onFavorite, onDelete, onEdit, onClick }) {
    const [showMenu, setShowMenu] = useState(false);
    const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.note;
    const Icon = config.icon;

    // Copy content to clipboard
    const handleCopy = async (e) => {
        e?.stopPropagation();
        const textToCopy = resource.content || resource.url || resource.title;
        try {
            await navigator.clipboard.writeText(textToCopy);
            toast.success('Copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy');
        }
        setShowMenu(false);
    };

    // Open bookmark URL or document file URL
    const handleOpen = (e) => {
        e?.stopPropagation();
        const urlToOpen = resource.url || resource.fileUrl;
        if (urlToOpen) {
            window.open(urlToOpen, '_blank', 'noopener,noreferrer');
        }
        setShowMenu(false);
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    // Truncate text
    const truncate = (text, length = 150) => {
        if (!text) return '';
        return text.length > length ? text.slice(0, length) + '...' : text;
    };

    return (
        <div
            className={`card group hover:shadow-elevated transition-all duration-200 cursor-pointer ${config.bgColor}`}
            onClick={() => onClick?.(resource)}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-neutral-800 shadow-soft flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {resource.title}
                        </h3>
                        {resource.type === 'bookmark' && resource.url && (
                            <p className="text-xs text-neutral-500 truncate">{resource.url}</p>
                        )}
                        {resource.type === 'snippet' && resource.codeLanguage && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 rounded mt-1">
                                {resource.codeLanguage}
                            </span>
                        )}
                        {resource.type === 'prompt' && resource.platform && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 rounded mt-1">
                                {resource.platform}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onFavorite?.(resource._id); }}
                            className={`p-1.5 rounded-lg transition-colors ${resource.favorite
                                ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30'
                                : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <Star className={`w-4 h-4 ${resource.favorite ? 'fill-current' : ''}`} />
                        </button>

                        {/* More menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-elevated border border-neutral-200 dark:border-neutral-700 py-1 z-20">
                                        {resource.type === 'bookmark' && resource.url && (
                                            <button
                                                onClick={handleOpen}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Open Link
                                            </button>
                                        )}
                                        {resource.type === 'document' && resource.fileUrl && (
                                            <button
                                                onClick={handleOpen}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Open Document
                                            </button>
                                        )}
                                        <button
                                            onClick={handleCopy}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => { onEdit?.(resource); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                                        <button
                                            onClick={() => { onDelete?.(resource._id); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Preview */}
                {(resource.content || resource.description || resource.annotations) && (
                    <p className={`text-sm text-neutral-600 dark:text-neutral-400 mb-3 ${resource.type === 'snippet' ? 'font-mono text-xs bg-neutral-100 dark:bg-neutral-700 p-2 rounded' : ''
                        }`}>
                        {truncate(resource.content || resource.description || resource.annotations)}
                    </p>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {resource.tags.slice(0, 5).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {resource.tags.length > 5 && (
                            <span className="px-2 py-0.5 text-xs text-neutral-500">
                                +{resource.tags.length - 5} more
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-2">
                        {resource.folderId && (
                            <span className="flex items-center gap-1">
                                <Folder className="w-3 h-3" />
                                {resource.folderId.name || 'Folder'}
                            </span>
                        )}
                    </div>
                    <span>{formatDate(resource.createdAt)}</span>
                </div>
            </div>
        </div >
    );
}
