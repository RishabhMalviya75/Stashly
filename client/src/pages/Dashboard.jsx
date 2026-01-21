/**
 * Dashboard Page
 * ==============
 * Main application dashboard - Meta/Facebook-inspired
 * This is a placeholder that we'll expand in Week 3.
 */

import { useAuth } from '../context/AuthContext';
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
    Home,
    Folder,
    Star,
    Clock,
} from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();

    // Get user initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h1 className="text-xl font-bold text-primary-500">Stashly</h1>
                </div>

                {/* Search */}
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-700 rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
                    {/* Quick Access */}
                    <div className="sidebar-item sidebar-item-active">
                        <Home className="w-5 h-5" />
                        <span>Home</span>
                    </div>
                    <div className="sidebar-item">
                        <Star className="w-5 h-5" />
                        <span>Favorites</span>
                    </div>
                    <div className="sidebar-item">
                        <Clock className="w-5 h-5" />
                        <span>Recent</span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-3"></div>

                    {/* Resource Types */}
                    <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        Resources
                    </p>
                    <div className="sidebar-item">
                        <Bookmark className="w-5 h-5 text-bookmark" />
                        <span>Bookmarks</span>
                    </div>
                    <div className="sidebar-item">
                        <MessageSquare className="w-5 h-5 text-prompt" />
                        <span>AI Prompts</span>
                    </div>
                    <div className="sidebar-item">
                        <Code className="w-5 h-5 text-code" />
                        <span>Code Snippets</span>
                    </div>
                    <div className="sidebar-item">
                        <FileText className="w-5 h-5 text-document" />
                        <span>Documents</span>
                    </div>
                    <div className="sidebar-item">
                        <StickyNote className="w-5 h-5 text-note" />
                        <span>Notes</span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-3"></div>

                    {/* Folders */}
                    <div className="flex items-center justify-between px-3 mb-2">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Folders
                        </p>
                        <button className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded">
                            <Plus className="w-4 h-4 text-neutral-500" />
                        </button>
                    </div>
                    <div className="sidebar-item">
                        <Folder className="w-5 h-5" />
                        <span>All Resources</span>
                    </div>
                </nav>

                {/* User Menu */}
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                        <div className="avatar text-sm">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full rounded-full" />
                            ) : (
                                getInitials(user?.displayName || 'User')
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user?.displayName}</p>
                            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-14 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-6">
                    <h2 className="text-lg font-semibold">Home</h2>
                    <div className="flex items-center gap-2">
                        <button className="btn-ghost p-2">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button onClick={logout} className="btn-ghost p-2 text-error hover:bg-error-light">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {user?.displayName?.split(' ')[0]}
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Your personal resource hub is ready. Start organizing your digital resources.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Quick Add</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { icon: Bookmark, label: 'Bookmark', color: 'bg-blue-50 text-bookmark dark:bg-blue-900/20' },
                                { icon: MessageSquare, label: 'AI Prompt', color: 'bg-emerald-50 text-prompt dark:bg-emerald-900/20' },
                                { icon: Code, label: 'Code Snippet', color: 'bg-green-50 text-code dark:bg-green-900/20' },
                                { icon: FileText, label: 'Document', color: 'bg-orange-50 text-document dark:bg-orange-900/20' },
                                { icon: StickyNote, label: 'Note', color: 'bg-blue-50 text-note dark:bg-blue-900/20' },
                            ].map(({ icon: Icon, label, color }) => (
                                <button
                                    key={label}
                                    className={`card p-4 flex flex-col items-center gap-3 hover:shadow-elevated transition-shadow ${color}`}
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

                    {/* Empty State */}
                    <div className="card p-12 text-center">
                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Folder className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                            Start building your digital resource library. Save bookmarks, prompts, code snippets, and more.
                        </p>
                        <button className="btn-primary">
                            <Plus className="w-4 h-4" />
                            Add Your First Resource
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
