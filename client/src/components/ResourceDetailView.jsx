/**
 * ResourceDetailView Component
 * ============================
 * Modal to display full details of a resource when clicked.
 */

import { X, ExternalLink, Copy, Edit, Trash2, Star, Calendar, Folder, Tag, Download } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Check if a file is an office document
 */
const isOfficeDocument = (fileName) => {
    if (!fileName) return false;
    const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    return officeExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

/**
 * Check if a file is a PDF
 */
const isPDF = (fileName) => {
    if (!fileName) return false;
    return fileName.toLowerCase().endsWith('.pdf');
};

/**
 * Check if a file is an image
 */
const isImage = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

/**
 * Get the viewer URL:
 * - Images use direct URL (displayed with img tag)
 * - PDFs and Office docs use Google Docs gview
 */
const getViewerUrl = (fileUrl, fileName) => {
    if (!fileUrl) return fileUrl;

    // Images can be displayed directly by the browser
    if (isImage(fileName)) {
        return fileUrl;
    }

    // PDFs and Office documents use Google Docs gview
    if (isPDF(fileName) || isOfficeDocument(fileName)) {
        return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }

    return fileUrl;
};

export default function ResourceDetailView({
    resource,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onFavorite
}) {
    if (!isOpen || !resource) return null;

    // Copy content to clipboard
    const handleCopy = (text, label = 'Content') => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get icon based on type
    const getTypeStyles = () => {
        switch (resource.type) {
            case 'bookmark':
                return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Bookmark' };
            case 'prompt':
                return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'AI Prompt' };
            case 'snippet':
                return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Code Snippet' };
            case 'document':
                return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', label: 'Document' };
            case 'note':
                return { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', label: 'Note' };
            default:
                return { bg: 'bg-neutral-100 dark:bg-neutral-700', text: 'text-neutral-600', label: 'Resource' };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-neutral-800 rounded-xl shadow-2xl animate-scaleIn">
                {/* Header */}
                <div className="flex items-start justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeStyles.bg} ${typeStyles.text}`}>
                                {typeStyles.label}
                            </span>
                            {resource.favorite && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                        </div>
                        <h2 className="text-xl font-semibold truncate">{resource.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
                    {/* URL for bookmarks */}
                    {resource.type === 'bookmark' && resource.url && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-500 mb-1">URL</label>
                            <div className="flex items-center gap-2">
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(resource.url, '_blank', 'noopener,noreferrer');
                                    }}
                                    className="flex-1 text-primary-600 hover:text-primary-700 hover:underline truncate cursor-pointer"
                                >
                                    {resource.url}
                                </a>
                                <button
                                    onClick={() => handleCopy(resource.url, 'URL')}
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                                    title="Copy URL"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Document Preview */}
                    {resource.type === 'document' && resource.fileUrl && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-neutral-500">
                                    Document {resource.fileName && `(${resource.fileName})`}
                                </label>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleCopy(resource.fileUrl, 'File URL')}
                                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                                        title="Copy file URL"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <a
                                        href={resource.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                                        title="Open in new tab"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Different preview based on file type */}
                            {isImage(resource.fileName) ? (
                                /* Image Preview */
                                <div className="w-full h-80 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                    <img
                                        src={resource.fileUrl}
                                        alt={resource.fileName || 'Image preview'}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ) : isPDF(resource.fileName) ? (
                                /* PDF - Use Google Docs Viewer for inline preview */
                                <div className="w-full h-80 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                    <iframe
                                        src={getViewerUrl(resource.fileUrl, resource.fileName)}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        title={resource.fileName || 'PDF Preview'}
                                        loading="lazy"
                                    />
                                </div>
                            ) : isOfficeDocument(resource.fileName) ? (
                                /* Office Documents - Use Google Docs Viewer */
                                <div className="w-full h-80 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                    <iframe
                                        src={getViewerUrl(resource.fileUrl, resource.fileName)}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        title={resource.fileName || 'Document Preview'}
                                        loading="lazy"
                                    />
                                </div>
                            ) : (
                                /* Other files - Download link */
                                <div className="w-full p-8 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
                                    <div className="text-6xl mb-4">📁</div>
                                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                        {resource.fileName || 'File'}
                                    </p>
                                    <a
                                        href={resource.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download File
                                    </a>
                                </div>
                            )}

                            {(isPDF(resource.fileName) || isOfficeDocument(resource.fileName)) && (
                                <p className="text-xs text-neutral-500">
                                    If preview doesn't load, <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">click here to download</a>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Content for prompts, snippets, notes */}
                    {['prompt', 'snippet', 'note'].includes(resource.type) && resource.content && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-neutral-500">
                                    {resource.type === 'snippet' ? 'Code' : 'Content'}
                                </label>
                                <button
                                    onClick={() => handleCopy(resource.content)}
                                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </button>
                            </div>
                            <pre className={`p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-x-auto text-sm ${resource.type === 'snippet' ? 'font-mono' : ''
                                }`}>
                                {resource.content}
                            </pre>
                            {resource.codeLanguage && (
                                <p className="text-xs text-neutral-500 mt-1">Language: {resource.codeLanguage}</p>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {resource.description && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-500 mb-1">Description</label>
                            <p className="text-neutral-700 dark:text-neutral-300">{resource.description}</p>
                        </div>
                    )}

                    {/* Annotations / Personal Note */}
                    {resource.annotations && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-500 mb-1">Why I saved this</label>
                            <p className="text-neutral-700 dark:text-neutral-300 italic">{resource.annotations}</p>
                        </div>
                    )}

                    {/* Platform & Category for prompts */}
                    {resource.type === 'prompt' && (resource.platform || resource.category) && (
                        <div className="flex gap-4">
                            {resource.platform && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-1">Platform</label>
                                    <p>{resource.platform}</p>
                                </div>
                            )}
                            {resource.category && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-1">Category</label>
                                    <p>{resource.category}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                        <div>
                            <label className="flex items-center gap-1 text-sm font-medium text-neutral-500 mb-2">
                                <Tag className="w-3 h-3" />
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {resource.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Folder */}
                    {resource.folderId && (
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <Folder className="w-4 h-4" />
                            <span>{resource.folderId.name || 'Unknown Folder'}</span>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {formatDate(resource.createdAt)}</span>
                        </div>
                        {resource.updatedAt !== resource.createdAt && (
                            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>Updated: {formatDate(resource.updatedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <button
                        onClick={() => onFavorite?.(resource._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${resource.favorite
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                            : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                    >
                        <Star className={`w-4 h-4 ${resource.favorite ? 'fill-current' : ''}`} />
                        {resource.favorite ? 'Favorited' : 'Add to Favorites'}
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                onClose();
                                onEdit?.(resource);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onDelete?.(resource._id);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
