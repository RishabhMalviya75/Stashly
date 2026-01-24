/**
 * SearchModal Component
 * =====================
 * Global search modal with keyboard shortcuts (Cmd/Ctrl + K)
 * Features:
 * - Debounced search across all resources
 * - Keyboard navigation (arrows, enter, escape)
 * - Recent searches history
 * - Type filtering
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Bookmark, MessageSquare, Code, FileText, StickyNote, Clock, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import api from '../services/api';

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

// Get icon by resource type
const getTypeIcon = (type) => {
    const icons = {
        bookmark: Bookmark,
        prompt: MessageSquare,
        snippet: Code,
        document: FileText,
        note: StickyNote
    };
    return icons[type] || FileText;
};

// Get type colors
const getTypeColor = (type) => {
    const colors = {
        bookmark: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
        prompt: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
        snippet: 'text-green-500 bg-green-100 dark:bg-green-900/30',
        document: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
        note: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30'
    };
    return colors[type] || 'text-neutral-500 bg-neutral-100 dark:bg-neutral-700';
};

export default function SearchModal({ isOpen, onClose, onSelectResource }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    const debouncedQuery = useDebounce(query, 200);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('stashly_recent_searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recent searches');
            }
        }
    }, []);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
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

    // Search when debounced query changes
    useEffect(() => {
        const searchResources = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get('/resources', {
                    params: { search: debouncedQuery, limit: 10 }
                });
                setResults(response.data.data.resources || []);
                setSelectedIndex(0);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        searchResources();
    }, [debouncedQuery]);

    // Save to recent searches
    const saveRecentSearch = useCallback((searchQuery) => {
        if (!searchQuery.trim()) return;

        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('stashly_recent_searches', JSON.stringify(updated));
    }, [recentSearches]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    results.length > 0 ? Math.min(prev + 1, results.length - 1) : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    saveRecentSearch(query);
                    onSelectResource?.(results[selectedIndex]);
                    onClose();
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
            default:
                break;
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && results.length > 0) {
            const selectedItem = resultsRef.current.children[selectedIndex];
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, results.length]);

    // Handle clicking a recent search
    const handleRecentSearchClick = (searchTerm) => {
        setQuery(searchTerm);
    };

    // Handle selecting a result
    const handleResultClick = (resource) => {
        saveRecentSearch(query);
        onSelectResource?.(resource);
        onClose();
    };

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('stashly_recent_searches');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-0 md:pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full h-full md:h-auto md:max-w-2xl bg-white dark:bg-neutral-800 md:rounded-xl shadow-2xl overflow-hidden animate-scaleIn"
                onKeyDown={handleKeyDown}
            >
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                    <Search className="w-5 h-5 text-neutral-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search resources... (type to search)"
                        className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-neutral-400"
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                        >
                            <X className="w-4 h-4 text-neutral-400" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="ml-2 px-2 py-1 text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-700 rounded"
                    >
                        ESC
                    </button>
                </div>

                {/* Results / Recent Searches */}
                <div className="max-h-[400px] overflow-y-auto">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full" />
                        </div>
                    )}

                    {/* Search Results */}
                    {!loading && results.length > 0 && (
                        <div ref={resultsRef} className="py-2">
                            <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                                Results
                            </div>
                            {results.map((resource, index) => {
                                const Icon = getTypeIcon(resource.type);
                                const isSelected = index === selectedIndex;

                                return (
                                    <button
                                        key={resource._id}
                                        onClick={() => handleResultClick(resource)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected
                                            ? 'bg-primary-50 dark:bg-primary-900/20'
                                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{resource.title}</p>
                                            <p className="text-sm text-neutral-500 truncate">
                                                {resource.url || resource.content?.slice(0, 60) || resource.description?.slice(0, 60) || resource.type}
                                            </p>
                                        </div>
                                        <span className="text-xs text-neutral-400 capitalize">{resource.type}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && query && results.length === 0 && (
                        <div className="py-12 text-center">
                            <Search className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                            <p className="text-neutral-500">No resources found for "{query}"</p>
                            <p className="text-sm text-neutral-400 mt-1">Try a different search term</p>
                        </div>
                    )}

                    {/* Recent Searches (when no query) */}
                    {!loading && !query && recentSearches.length > 0 && (
                        <div className="py-2">
                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                                    Recent Searches
                                </span>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-neutral-400 hover:text-neutral-600"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRecentSearchClick(search)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                                >
                                    <Clock className="w-4 h-4 text-neutral-400" />
                                    <span>{search}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty State (no query, no recent searches) */}
                    {!loading && !query && recentSearches.length === 0 && (
                        <div className="py-12 text-center">
                            <Search className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                            <p className="text-neutral-500">Start typing to search</p>
                            <p className="text-sm text-neutral-400 mt-1">Search across all your resources</p>
                        </div>
                    )}
                </div>

                {/* Footer with keyboard hints */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            <ArrowDown className="w-3 h-3" />
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <CornerDownLeft className="w-3 h-3" />
                            Open
                        </span>
                    </div>
                    <span>Press ESC to close</span>
                </div>
            </div>
        </div>
    );
}
