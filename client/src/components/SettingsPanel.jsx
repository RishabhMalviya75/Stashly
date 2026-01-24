/**
 * SettingsPanel Component
 * =======================
 * Slide-out panel for user settings and preferences.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    X,
    Sun,
    Moon,
    Monitor,
    LogOut,
    User,
    Palette
} from 'lucide-react';

export default function SettingsPanel({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    // Apply theme on mount and changes
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor }
    ];

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Panel - slides in from right */}
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-neutral-800 shadow-2xl animate-slideIn">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
                    {/* User Profile */}
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                        <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-lg font-semibold">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                getInitials(user?.displayName)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{user?.displayName}</p>
                            <p className="text-sm text-neutral-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-5 h-5 text-neutral-500" />
                            <h3 className="font-medium">Appearance</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {themeOptions.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setTheme(value)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${theme === value
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${theme === value ? 'text-primary-500' : 'text-neutral-500'
                                        }`} />
                                    <span className={`text-sm font-medium ${theme === value ? 'text-primary-600 dark:text-primary-400' : ''
                                        }`}>
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Account Section */}
                    {/* Logout */}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
