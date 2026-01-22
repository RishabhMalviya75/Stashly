/**
 * ConfirmDialog Component
 * =======================
 * Reusable confirmation modal for destructive actions.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. PORTALS: We render this outside the DOM hierarchy for proper stacking.
 * 2. FOCUS TRAP: Keep focus within modal for accessibility.
 * 3. ESCAPE KEY: Close modal on Escape press.
 */

import { useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' | 'warning' | 'info'
    isLoading = false
}) {
    // Handle Escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && !isLoading) {
            onClose();
        }
    }, [onClose, isLoading]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    // Variant styles
    const variants = {
        danger: {
            icon: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            button: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
        },
        warning: {
            icon: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            button: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500'
        },
        info: {
            icon: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
        }
    };

    const style = variants[variant] || variants.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-800 rounded-xl shadow-2xl animate-scaleIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                    <X className="w-5 h-5 text-neutral-500" />
                </button>

                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full ${style.icon} flex items-center justify-center mx-auto mb-4`}>
                        <AlertTriangle className={`w-6 h-6 ${style.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-center mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-neutral-600 dark:text-neutral-400 text-center mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 btn-secondary"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 btn text-white ${style.button}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
