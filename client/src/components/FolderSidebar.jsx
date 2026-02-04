/**
 * FolderSidebar Component
 * =======================
 * Sidebar component for folder navigation and management.
 * Week 3: Improved with submit button, edit/delete context menu
 */

import { useState, useEffect, useRef } from 'react';
import {
    Folder,
    FolderPlus,
    ChevronRight,
    Home,
    Star,
    Clock,
    Plus,
    X,
    Check,
    Loader2,
    MoreVertical,
    Edit,
    Trash2,
    Users
} from 'lucide-react';
import { folderAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function FolderSidebar({
    selectedFolderId,
    onFolderSelect,
    onViewChange,
    currentView = 'home'
}) {
    const [folders, setFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Edit state
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editFolderName, setEditFolderName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Context menu
    const [contextMenu, setContextMenu] = useState({ isOpen: false, folderId: null, x: 0, y: 0 });

    const inputRef = useRef(null);
    const editInputRef = useRef(null);

    // Fetch folders
    useEffect(() => {
        fetchFolders();
    }, []);

    // Focus input when create form opens
    useEffect(() => {
        if (showCreateForm && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showCreateForm]);

    // Focus input when editing
    useEffect(() => {
        if (editingFolderId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingFolderId]);

    // Close context menu on outside click
    useEffect(() => {
        const handleClick = () => setContextMenu({ isOpen: false, folderId: null, x: 0, y: 0 });
        if (contextMenu.isOpen) {
            document.addEventListener('click', handleClick);
        }
        return () => document.removeEventListener('click', handleClick);
    }, [contextMenu.isOpen]);

    const fetchFolders = async () => {
        try {
            const res = await folderAPI.getAll();
            setFolders(res.data.data.folders);
        } catch (error) {
            console.error('Failed to fetch folders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create new folder
    const handleCreateFolder = async (e) => {
        e?.preventDefault();
        if (!newFolderName.trim()) return;

        setIsCreating(true);
        try {
            await folderAPI.create({ name: newFolderName.trim() });
            toast.success('Folder created!');
            setNewFolderName('');
            setShowCreateForm(false);
            fetchFolders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create folder');
        } finally {
            setIsCreating(false);
        }
    };

    // Start editing folder
    const handleStartEdit = (folder) => {
        setEditingFolderId(folder._id);
        setEditFolderName(folder.name);
        setContextMenu({ isOpen: false, folderId: null, x: 0, y: 0 });
    };

    // Save folder edit
    const handleSaveEdit = async (folderId) => {
        if (!editFolderName.trim()) {
            setEditingFolderId(null);
            return;
        }

        setIsUpdating(true);
        try {
            await folderAPI.update(folderId, { name: editFolderName.trim() });
            toast.success('Folder renamed!');
            setEditingFolderId(null);
            fetchFolders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to rename folder');
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete folder
    const handleDeleteFolder = async (folderId) => {
        if (!confirm('Delete this folder? Contents will be moved to root.')) return;

        setContextMenu({ isOpen: false, folderId: null, x: 0, y: 0 });

        try {
            await folderAPI.delete(folderId, { params: { force: 'true' } });
            toast.success('Folder deleted!');
            fetchFolders();
            if (selectedFolderId === folderId) {
                onFolderSelect?.(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete folder');
        }
    };

    // Show context menu
    const handleContextMenu = (e, folderId) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            isOpen: true,
            folderId,
            x: e.clientX,
            y: e.clientY
        });
    };

    // Navigation items
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'favorites', label: 'Favorites', icon: Star },
        { id: 'recent', label: 'Recent', icon: Clock }
    ];

    return (
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
            {/* Quick Access */}
            {navItems.map(item => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange?.(item.id)}
                        className={`sidebar-item w-full ${currentView === item.id ? 'sidebar-item-active' : ''
                            }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </button>
                );
            })}

            {/* Divider */}
            <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-3"></div>

            {/* Folders Header */}
            <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Folders
                </p>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                    title="Create folder"
                >
                    <Plus className="w-4 h-4 text-neutral-500" />
                </button>
            </div>

            {/* Create Folder Form - Improved UX */}
            {showCreateForm && (
                <form onSubmit={handleCreateFolder} className="px-2 mb-2">
                    <div className="flex items-center gap-1 p-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <FolderPlus className="w-4 h-4 text-primary-500 flex-shrink-0 ml-1" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Folder name"
                            className="flex-1 text-sm bg-transparent border-0 focus:ring-0 p-1"
                            disabled={isCreating}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setShowCreateForm(false);
                                    setNewFolderName('');
                                }
                            }}
                        />
                        {isCreating ? (
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                        ) : (
                            <>
                                <button
                                    type="submit"
                                    disabled={!newFolderName.trim()}
                                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded disabled:opacity-50 text-green-600"
                                    title="Create"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewFolderName('');
                                    }}
                                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded text-neutral-500"
                                    title="Cancel"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </form>
            )}

            {/* All Resources */}
            <button
                onClick={() => onFolderSelect?.(null)}
                className={`sidebar-item w-full ${selectedFolderId === null && currentView === 'folder' ? 'sidebar-item-active' : ''
                    }`}
            >
                <Folder className="w-5 h-5" />
                <span>All Resources</span>
            </button>

            {/* Loading */}
            {isLoading && (
                <div className="px-3 py-2">
                    <div className="animate-pulse space-y-2">
                        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
                        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    </div>
                </div>
            )}

            {/* Folder List */}
            {!isLoading && folders.map(folder => (
                <div key={folder._id} className="relative group">
                    {editingFolderId === folder._id ? (
                        // Editing mode
                        <div className="flex items-center gap-1 px-2 py-1">
                            <Folder className="w-5 h-5" style={{ color: folder.color }} />
                            <input
                                ref={editInputRef}
                                type="text"
                                value={editFolderName}
                                onChange={(e) => setEditFolderName(e.target.value)}
                                className="flex-1 text-sm bg-neutral-100 dark:bg-neutral-700 border-0 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
                                disabled={isUpdating}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(folder._id);
                                    if (e.key === 'Escape') setEditingFolderId(null);
                                }}
                                onBlur={() => handleSaveEdit(folder._id)}
                            />
                            {isUpdating && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                        </div>
                    ) : (
                        // Normal display
                        <div
                            onClick={() => onFolderSelect?.(folder._id)}
                            onContextMenu={(e) => handleContextMenu(e, folder._id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onFolderSelect?.(folder._id);
                                }
                            }}
                            className={`sidebar-item w-full group cursor-pointer ${selectedFolderId === folder._id ? 'sidebar-item-active' : ''
                                }`}
                        >
                            <Folder
                                className="w-5 h-5"
                                style={{ color: folder.color }}
                            />
                            <span className="flex-1 text-left truncate">{folder.name}</span>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleContextMenu(e, folder._id);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        handleContextMenu(e, folder._id);
                                    }
                                }}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded transition-opacity cursor-pointer"
                            >
                                <MoreVertical className="w-3 h-3" />
                            </span>
                        </div>
                    )}
                </div>
            ))}

            {/* Empty folders state */}
            {!isLoading && folders.length === 0 && (
                <p className="px-3 py-2 text-xs text-neutral-500 text-center">
                    No folders yet.
                    <br />
                    Click + to create one.
                </p>
            )}

            {/* Context Menu */}
            {contextMenu.isOpen && (
                <div
                    className="fixed bg-white dark:bg-neutral-800 rounded-lg shadow-elevated border border-neutral-200 dark:border-neutral-700 py-1 z-50 min-w-[140px] animate-scaleIn"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={() => {
                            const folder = folders.find(f => f._id === contextMenu.folderId);
                            if (folder) handleStartEdit(folder);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                        <Edit className="w-4 h-4" />
                        Rename
                    </button>
                    <button
                        onClick={() => handleDeleteFolder(contextMenu.folderId)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </nav>
    );
}
