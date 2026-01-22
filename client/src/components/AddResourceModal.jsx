/**
 * ResourceModal Component
 * =======================
 * Modal dialog for creating AND editing resources with type-specific forms.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. REACT HOOK FORM: We use react-hook-form for efficient form handling.
 *    It minimizes re-renders and provides great validation support.
 * 
 * 2. DYNAMIC FORMS: Different resource types need different fields.
 *    We conditionally render fields based on the selected type.
 * 
 * 3. EDIT MODE: When editResource prop is provided, the form pre-fills
 *    with existing data and calls update API instead of create.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    X,
    Bookmark,
    MessageSquare,
    Code,
    FileText,
    StickyNote,
    Loader2,
    FolderOpen
} from 'lucide-react';
import { resourceAPI, folderAPI } from '../services/api';

// Resource type configuration
const RESOURCE_TYPES = [
    { type: 'bookmark', label: 'Bookmark', icon: Bookmark, color: 'text-blue-500' },
    { type: 'prompt', label: 'AI Prompt', icon: MessageSquare, color: 'text-emerald-500' },
    { type: 'snippet', label: 'Code Snippet', icon: Code, color: 'text-green-500' },
    { type: 'document', label: 'Document', icon: FileText, color: 'text-orange-500' },
    { type: 'note', label: 'Note', icon: StickyNote, color: 'text-indigo-500' }
];

export default function ResourceModal({
    isOpen,
    onClose,
    onSuccess,
    defaultType = 'bookmark',
    editResource = null // Pass resource object to enable edit mode
}) {
    const isEditMode = !!editResource;
    const [selectedType, setSelectedType] = useState(defaultType);
    const [folders, setFolders] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm();

    // Fetch folders on mount
    useEffect(() => {
        if (isOpen) {
            folderAPI.getAll()
                .then(res => setFolders(res.data.data.folders))
                .catch(err => console.error('Failed to fetch folders:', err));
        }
    }, [isOpen]);

    // Reset form when modal opens or populate with edit data
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editResource) {
                // Edit mode: populate form with existing data
                setSelectedType(editResource.type);
                setValue('title', editResource.title || '');
                setValue('url', editResource.url || '');
                setValue('content', editResource.content || '');
                setValue('description', editResource.description || '');
                setValue('annotations', editResource.annotations || '');
                setValue('platform', editResource.platform || '');
                setValue('category', editResource.category || '');
                setValue('codeLanguage', editResource.codeLanguage || '');
                setValue('fileUrl', editResource.fileUrl || '');
                setValue('fileName', editResource.fileName || '');
                setValue('folderId', editResource.folderId?._id || editResource.folderId || '');
                setValue('tags', editResource.tags?.join(', ') || '');
            } else {
                // Create mode: reset form completely
                reset({
                    title: '',
                    url: '',
                    content: '',
                    description: '',
                    annotations: '',
                    platform: '',
                    category: '',
                    codeLanguage: '',
                    fileUrl: '',
                    fileName: '',
                    folderId: '',
                    tags: ''
                });
                setSelectedType(defaultType);
            }
        }
    }, [isOpen, isEditMode, editResource, defaultType, reset, setValue]);

    // Reset type-specific fields when switching types in create mode
    useEffect(() => {
        if (isOpen && !isEditMode) {
            // Clear type-specific fields when switching types
            setValue('url', '');
            setValue('content', '');
            setValue('platform', '');
            setValue('category', '');
            setValue('codeLanguage', '');
            setValue('fileUrl', '');
            setValue('fileName', '');
        }
    }, [selectedType, isOpen, isEditMode, setValue]);

    // Handle form submission
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                type: selectedType,
                title: data.title,
                annotations: data.annotations || '',
                tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                folderId: data.folderId || null
            };

            // Add type-specific fields
            switch (selectedType) {
                case 'bookmark':
                    payload.url = data.url;
                    payload.description = data.description || '';
                    break;
                case 'prompt':
                    payload.content = data.content;
                    payload.platform = data.platform || '';
                    payload.category = data.category || '';
                    break;
                case 'snippet':
                    payload.content = data.content;
                    payload.codeLanguage = data.codeLanguage || '';
                    payload.description = data.description || '';
                    break;
                case 'document':
                    payload.fileUrl = data.fileUrl || '';
                    payload.fileName = data.fileName || '';
                    payload.description = data.description || '';
                    break;
                case 'note':
                    payload.content = data.content;
                    break;
            }

            if (isEditMode) {
                await resourceAPI.update(editResource._id, payload);
                toast.success('Resource updated successfully!');
            } else {
                await resourceAPI.create(payload);
                toast.success('Resource created successfully!');
            }

            reset();
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error(`${isEditMode ? 'Update' : 'Create'} resource error:`, error);
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} resource`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-neutral-800 rounded-xl shadow-2xl mx-4 animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold">
                        {isEditMode ? 'Edit Resource' : 'Add New Resource'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Type Selector - disabled in edit mode */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex flex-wrap gap-2">
                        {RESOURCE_TYPES.map(({ type, label, icon: Icon, color }) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => !isEditMode && setSelectedType(type)}
                                disabled={isEditMode}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${selectedType === type
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-transparent bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                    } ${isEditMode && selectedType !== type ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Icon className={`w-4 h-4 ${color}`} />
                                <span className="text-sm font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-4">
                        {/* Title - All types */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('title', { required: 'Title is required' })}
                                type="text"
                                placeholder="Enter a descriptive title"
                                className="input w-full"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        {/* URL - Bookmark only */}
                        {selectedType === 'bookmark' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('url', {
                                        required: 'URL is required for bookmarks',
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: 'Please enter a valid URL'
                                        }
                                    })}
                                    type="url"
                                    placeholder="https://example.com"
                                    className="input w-full"
                                />
                                {errors.url && (
                                    <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
                                )}
                            </div>
                        )}

                        {/* Content - Prompt, Snippet, Note */}
                        {['prompt', 'snippet', 'note'].includes(selectedType) && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register('content', { required: 'Content is required' })}
                                    rows={selectedType === 'snippet' ? 10 : 6}
                                    placeholder={
                                        selectedType === 'prompt'
                                            ? 'Enter your AI prompt...'
                                            : selectedType === 'snippet'
                                                ? 'Paste your code here...'
                                                : 'Write your note...'
                                    }
                                    className={`input w-full resize-none ${selectedType === 'snippet' ? 'font-mono text-sm' : ''
                                        }`}
                                />
                                {errors.content && (
                                    <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                                )}
                            </div>
                        )}

                        {/* Platform & Category - Prompt only */}
                        {selectedType === 'prompt' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Platform</label>
                                    <input
                                        {...register('platform')}
                                        type="text"
                                        placeholder="ChatGPT, Claude, Midjourney..."
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <input
                                        {...register('category')}
                                        type="text"
                                        placeholder="Coding, Writing, Image..."
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Language - Snippet only */}
                        {selectedType === 'snippet' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Language</label>
                                <input
                                    {...register('codeLanguage')}
                                    type="text"
                                    placeholder="javascript, python, css..."
                                    className="input w-full"
                                />
                            </div>
                        )}

                        {/* File URL & Name - Document only */}
                        {selectedType === 'document' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">File URL</label>
                                    <input
                                        {...register('fileUrl')}
                                        type="url"
                                        placeholder="https://example.com/doc.pdf"
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">File Name</label>
                                    <input
                                        {...register('fileName')}
                                        type="text"
                                        placeholder="document.pdf"
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Description - Bookmark, Snippet, Document */}
                        {['bookmark', 'snippet', 'document'].includes(selectedType) && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    {...register('description')}
                                    rows={2}
                                    placeholder="Brief description..."
                                    className="input w-full resize-none"
                                />
                            </div>
                        )}

                        {/* Annotations - All types */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Why I saved this (personal note)
                            </label>
                            <textarea
                                {...register('annotations')}
                                rows={2}
                                placeholder="Your personal notes about why this is useful..."
                                className="input w-full resize-none"
                            />
                        </div>

                        {/* Folder - All types */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                <FolderOpen className="w-4 h-4 inline mr-1" />
                                Folder
                            </label>
                            <select
                                {...register('folderId')}
                                className="input w-full"
                            >
                                <option value="">No folder (root)</option>
                                {folders.map(folder => (
                                    <option key={folder._id} value={folder._id}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags - All types */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Tags</label>
                            <input
                                {...register('tags')}
                                type="text"
                                placeholder="react, tutorial, frontend (comma separated)"
                                className="input w-full"
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                Separate multiple tags with commas
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isEditMode ? 'Saving...' : 'Creating...'}
                                </>
                            ) : (
                                isEditMode ? 'Save Changes' : 'Create Resource'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
