/**
 * Dashboard Page
 * ==============
 * Main application dashboard - Meta/Facebook-inspired
 * Week 3: Enhanced UI with edit, delete confirmation, settings, and dark mode
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    LogOut,
    Bookmark,
    MessageSquare,
    Code,
    FileText,
    StickyNote,
    Plus,
    Search,
    Settings,
    ChevronDown,
    RefreshCw,
    Moon,
    Sun,
    Command,
    Menu,
    X,
    Home,
    Heart
} from 'lucide-react';
import { resourceAPI } from '../services/api';
import ResourceModal from '../components/AddResourceModal';
import ResourceList from '../components/ResourceList';
import FolderSidebar from '../components/FolderSidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import SettingsPanel from '../components/SettingsPanel';
import ResourceDetailView from '../components/ResourceDetailView';
import SearchModal from '../components/SearchModal';

// Resource type config for quick add buttons
const RESOURCE_TYPES = [
    { type: 'bookmark', icon: Bookmark, label: 'Bookmark', color: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' },
    { type: 'prompt', icon: MessageSquare, label: 'AI Prompt', color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' },
    { type: 'snippet', icon: Code, label: 'Code Snippet', color: 'bg-green-50 text-green-500 dark:bg-green-900/20' },
    { type: 'document', icon: FileText, label: 'Document', color: 'bg-orange-50 text-orange-500 dark:bg-orange-900/20' },
    { type: 'note', icon: StickyNote, label: 'Note', color: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20' }
];

export default function Dashboard() {
    const { user, logout } = useAuth();

    // State
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('home');
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    const [filterType, setFilterType] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDefaultType, setModalDefaultType] = useState('bookmark');
    const [editResource, setEditResource] = useState(null);

    // Settings panel
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, resourceId: null });

    // Resource detail view
    const [selectedResource, setSelectedResource] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Global search modal
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Mobile sidebar drawer
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Dark mode quick toggle
    const [isDark, setIsDark] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });

    // Watch for theme changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + K: Open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            // Alt + N: New resource
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                setEditResource(null);
                setIsModalOpen(true);
            }
            // Escape: Close modals
            if (e.key === 'Escape') {
                if (isSearchOpen) setIsSearchOpen(false);
                else if (isModalOpen) setIsModalOpen(false);
                else if (isSettingsOpen) setIsSettingsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isSettingsOpen, isSearchOpen]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isSidebarOpen]);

    // Fetch resources
    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {};

            // Apply filters based on current view
            if (currentView === 'favorites') {
                params.favorite = 'true';
            } else if (currentView === 'folder' && selectedFolderId) {
                params.folderId = selectedFolderId;
            }

            if (filterType) {
                params.type = filterType;
            }



            const res = await resourceAPI.getAll(params);
            setResources(res.data.data.resources);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            toast.error('Failed to load resources');
        } finally {
            setIsLoading(false);
        }
    }, [currentView, selectedFolderId, filterType]);

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // Handle quick add button click
    const handleQuickAdd = (type) => {
        setEditResource(null);
        setModalDefaultType(type);
        setIsModalOpen(true);
    };

    // Handle edit click
    const handleEdit = (resource) => {
        setSelectedResource(null); // Close detail view if open
        setEditResource(resource);
        setModalDefaultType(resource.type);
        setIsModalOpen(true);
    };

    // Handle favorite toggle
    const handleFavorite = async (resourceId) => {
        try {
            const resource = resources.find(r => r._id === resourceId);
            await resourceAPI.update(resourceId, { favorite: !resource?.favorite });
            // Optimistic update
            setResources(prev => prev.map(r =>
                r._id === resourceId ? { ...r, favorite: !r.favorite } : r
            ));
            toast.success(resource?.favorite ? 'Removed from favorites' : 'Added to favorites');
        } catch (error) {
            toast.error('Failed to update favorite');
            fetchResources(); // Refresh to get correct state
        }
    };

    // Handle delete request (opens confirmation)
    const handleDeleteRequest = (resourceId) => {
        setDeleteConfirm({ isOpen: true, resourceId });
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.resourceId) return;

        setIsDeleting(true);
        try {
            await resourceAPI.delete(deleteConfirm.resourceId);
            toast.success('Resource deleted');
            setResources(prev => prev.filter(r => r._id !== deleteConfirm.resourceId));
            setDeleteConfirm({ isOpen: false, resourceId: null });
        } catch (error) {
            toast.error('Failed to delete resource');
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle folder selection
    const handleFolderSelect = (folderId) => {
        setSelectedFolderId(folderId);
        setCurrentView('folder');
    };

    // Handle view change
    const handleViewChange = (view) => {
        setCurrentView(view);
        setSelectedFolderId(null);
    };



    // Toggle dark mode quickly
    const toggleDarkMode = () => {
        const root = document.documentElement;
        if (root.classList.contains('dark')) {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get page title based on current view
    const getPageTitle = () => {
        switch (currentView) {
            case 'favorites':
                return 'Favorites';
            case 'recent':
                return 'Recent';
            case 'folder':
                return selectedFolderId ? 'Folder' : 'All Resources';
            default:
                return 'Home';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on mobile, shown as drawer when open */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-white dark:bg-neutral-800 
                border-r border-neutral-200 dark:border-neutral-700 
                flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo + Close Button */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-primary-500">Stashly</h1>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Trigger - Opens SearchModal (Ctrl+K) */}
                <div className="p-3">
                    <button
                        onClick={() => { setIsSearchOpen(true); setIsSidebarOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        <span className="flex-1 text-left">Search...</span>
                        <kbd className="px-1.5 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-600 rounded hidden sm:inline">⌘K</kbd>
                    </button>
                </div>

                {/* Folder Navigation */}
                <FolderSidebar
                    selectedFolderId={selectedFolderId}
                    onFolderSelect={(id) => { handleFolderSelect(id); setIsSidebarOpen(false); }}
                    onViewChange={(view) => { handleViewChange(view); setIsSidebarOpen(false); }}
                    currentView={currentView}
                />

                {/* User Menu */}
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                        onClick={() => { setIsSettingsOpen(true); setIsSidebarOpen(false); }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                    >
                        <div className="avatar text-sm">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full rounded-full" />
                            ) : (
                                getInitials(user?.displayName || 'User')
                            )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium text-sm truncate">{user?.displayName}</p>
                            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu - Mobile Only */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <h2 className="text-lg font-semibold">{getPageTitle()}</h2>

                        {/* Type Filter - Hidden on small mobile */}
                        <select
                            value={filterType || ''}
                            onChange={(e) => setFilterType(e.target.value || null)}
                            className="hidden sm:block text-sm bg-neutral-100 dark:bg-neutral-700 rounded-lg border-0 py-1.5 px-3 focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All Types</option>
                            {RESOURCE_TYPES.map(({ type, label }) => (
                                <option key={type} value={type}>{label}s</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="btn-ghost p-2"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        <button
                            onClick={fetchResources}
                            className="btn-ghost p-2 hidden sm:flex"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="btn-ghost p-2 hidden md:flex"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button onClick={logout} className="btn-ghost p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hidden sm:flex">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Content - Extra padding at bottom for mobile nav */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6">
                    {/* Welcome Section - only on home */}
                    {currentView === 'home' && (
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold mb-2">
                                Welcome back, {user?.displayName?.split(' ')[0]}
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Your personal resource hub is ready. Start organizing your digital resources.
                                <span className="text-sm ml-2 text-neutral-400">
                                    (Tip: Press <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">Alt+N</kbd> to add a resource)
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Quick Actions - only on home */}
                    {currentView === 'home' && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Quick Add</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {RESOURCE_TYPES.map(({ type, icon: Icon, label, color }) => (
                                    <button
                                        key={type}
                                        onClick={() => handleQuickAdd(type)}
                                        className={`card p-4 flex flex-col items-center gap-3 hover:shadow-elevated transition-all duration-200 hover:scale-[1.02] ${color}`}
                                    >
                                        <div className="p-3 rounded-lg bg-white dark:bg-neutral-800 shadow-soft">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resources Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                {currentView === 'favorites' ? 'Favorite Resources' :
                                    currentView === 'folder' ? 'Resources' :
                                        'Recent Resources'}
                            </h3>
                            <button
                                onClick={() => {
                                    setEditResource(null);
                                    setIsModalOpen(true);
                                }}
                                className="btn-primary"
                            >
                                <Plus className="w-4 h-4" />
                                Add Resource
                            </button>
                        </div>

                        <ResourceList
                            resources={resources}
                            isLoading={isLoading}
                            onFavorite={handleFavorite}
                            onDelete={handleDeleteRequest}
                            onEdit={handleEdit}
                            onClick={(resource) => setSelectedResource(resource)}
                            onAdd={() => {
                                setEditResource(null);
                                setIsModalOpen(true);
                            }}
                            emptyType={
                                currentView === 'favorites' ? 'noFavorites' :
                                    currentView === 'folder' ? 'noFolderResources' :
                                        'noResources'
                            }
                        />
                    </div>
                </div>
            </main>

            {/* Resource Modal (Create/Edit) */}
            <ResourceModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditResource(null);
                }}
                onSuccess={fetchResources}
                defaultType={modalDefaultType}
                editResource={editResource}
            />

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, resourceId: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Resource"
                message="Are you sure you want to delete this resource? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isDeleting}
            />

            {/* Resource Detail View */}
            <ResourceDetailView
                resource={selectedResource}
                isOpen={!!selectedResource}
                onClose={() => setSelectedResource(null)}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onFavorite={handleFavorite}
            />

            {/* Global Search Modal (Cmd/Ctrl + K) */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectResource={(resource) => setSelectedResource(resource)}
            />

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 md:hidden z-30">
                <div className="flex items-center justify-around h-16">
                    <button
                        onClick={() => handleViewChange('home')}
                        className={`flex flex-col items-center gap-1 p-2 ${currentView === 'home' ? 'text-primary-500' : 'text-neutral-500'}`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-xs">Home</span>
                    </button>
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex flex-col items-center gap-1 p-2 text-neutral-500"
                    >
                        <Search className="w-5 h-5" />
                        <span className="text-xs">Search</span>
                    </button>
                    <button
                        onClick={() => { setEditResource(null); setIsModalOpen(true); }}
                        className="flex items-center justify-center w-12 h-12 -mt-4 bg-primary-500 text-white rounded-full shadow-lg"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => handleViewChange('favorites')}
                        className={`flex flex-col items-center gap-1 p-2 ${currentView === 'favorites' ? 'text-primary-500' : 'text-neutral-500'}`}
                    >
                        <Heart className="w-5 h-5" />
                        <span className="text-xs">Favorites</span>
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex flex-col items-center gap-1 p-2 text-neutral-500"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-xs">Settings</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
