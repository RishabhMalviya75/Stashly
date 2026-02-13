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

import { useState, useEffect, useRef } from 'react';
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
    FolderOpen,
    Upload,
    File,
    Trash2,
    Wand2
} from 'lucide-react';
import { resourceAPI, folderAPI, uploadAPI, aiAPI } from '../services/api';

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
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    // File upload state
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm();

    // Watch fields to determine if generate title button should be enabled
    const watchedContent = watch('content');
    const watchedUrl = watch('url');
    const watchedFileName = watch('fileName');

    // Generate title using AI
    const handleGenerateTitle = async () => {
        setIsGeneratingTitle(true);
        try {
            const payload = { type: selectedType };

            switch (selectedType) {
                case 'bookmark':
                    payload.url = watchedUrl;
                    break;
                case 'prompt':
                case 'snippet':
                case 'note':
                    payload.content = watchedContent;
                    break;
                case 'document':
                    payload.fileName = watchedFileName || uploadedFile?.fileName;
                    break;
            }

            const response = await aiAPI.generateTitle(payload);
            setValue('title', response.data.data.title);
            toast.success('Title generated!');
        } catch (error) {
            console.error('Generate title error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate title');
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    // Check if generate button should be enabled
    const canGenerateTitle = () => {
        switch (selectedType) {
            case 'bookmark': return !!watchedUrl;
            case 'prompt':
            case 'snippet':
            case 'note': return !!watchedContent;
            case 'document': return !!(watchedFileName || uploadedFile?.fileName);
            default: return false;
        }
    };

    // Fetch folders on mount
    useEffect(() => {
        if (isOpen) {
            folderAPI.getAll()
                .then(res => setFolders(res.data.data.folders))
                .catch(err => console.error('Failed to fetch folders:', err));
        }
    }, [isOpen]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
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
                setUploadedFile(null);
                setUploadProgress(0);
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

    // Handle file upload
    const handleFileUpload = async (file) => {
        if (!file) return;

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const response = await uploadAPI.upload(file, (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(progress);
            });

            const fileData = response.data.data;
            setUploadedFile(fileData);
            setValue('fileUrl', fileData.fileUrl);
            setValue('fileName', fileData.fileName);
            toast.success('File uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file removal
    const handleRemoveFile = async () => {
        if (uploadedFile?.publicId) {
            try {
                await uploadAPI.delete(uploadedFile.publicId);
            } catch (error) {
                console.error('Failed to delete file:', error);
            }
        }
        setUploadedFile(null);
        setValue('fileUrl', '');
        setValue('fileName', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

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
                    payload.fileUrl = data.fileUrl || uploadedFile?.fileUrl || '';
                    payload.fileName = data.fileName || uploadedFile?.fileName || '';
                    payload.fileSize = uploadedFile?.fileSize || 0;
                    payload.fileType = uploadedFile?.fileType || '';
                    payload.cloudinaryPublicId = uploadedFile?.publicId || '';
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
            setUploadedFile(null);
            setUploadProgress(0);
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
            <div className="relative w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] flex flex-col bg-white dark:bg-neutral-800 md:rounded-xl shadow-2xl md:mx-4 animate-scaleIn overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
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
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0 overflow-x-auto">
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
                                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-4 space-y-4">
                        {/* Title - All types */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGenerateTitle}
                                    disabled={isGeneratingTitle || !canGenerateTitle()}
                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all
                                        ${canGenerateTitle() && !isGeneratingTitle
                                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-sm hover:shadow-md'
                                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
                                        }`}
                                    title={canGenerateTitle() ? 'Auto-generate title with AI' : 'Add content first to generate a title'}
                                >
                                    {isGeneratingTitle ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-3.5 h-3.5" />
                                    )}
                                    {isGeneratingTitle ? 'Generating...' : '✨ AI Title'}
                                </button>
                            </div>
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

                        {/* File Upload - Document only */}
                        {selectedType === 'document' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium mb-1">
                                    Upload File
                                </label>

                                {!uploadedFile && !isEditMode ? (
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                                            ${isDragging
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                                            }
                                            ${isUploading ? 'pointer-events-none opacity-60' : ''}
                                        `}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e.target.files[0])}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg,.zip,.rar,.json"
                                        />

                                        {isUploading ? (
                                            <div className="space-y-3">
                                                <Loader2 className="w-10 h-10 mx-auto text-primary-500 animate-spin" />
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    Uploading... {uploadProgress}%
                                                </p>
                                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    <span className="font-medium text-primary-500">Click to upload</span>
                                                    {' '}or drag and drop
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    PDF, DOC, XLS, PPT, images, and more (max 10MB)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                ) : uploadedFile || (isEditMode && editResource?.fileUrl) ? (
                                    <div className="flex items-center gap-3 p-4 bg-neutral-100 dark:bg-neutral-700 rounded-xl">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                            <File className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {uploadedFile?.fileName || editResource?.fileName || 'Uploaded file'}
                                            </p>
                                            {uploadedFile?.fileSize && (
                                                <p className="text-xs text-neutral-500">
                                                    {(uploadedFile.fileSize / 1024).toFixed(1)} KB
                                                </p>
                                            )}
                                        </div>
                                        <a
                                            href={uploadedFile?.fileUrl || editResource?.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary-500 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View
                                        </a>
                                        {!isEditMode && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ) : null}

                                {/* Hidden inputs for form data */}
                                <input type="hidden" {...register('fileUrl')} />
                                <input type="hidden" {...register('fileName')} />
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

                    {/* Actions - Sticky Footer */}
                    <div className="flex justify-end gap-3 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 sticky bottom-0 z-10">
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
