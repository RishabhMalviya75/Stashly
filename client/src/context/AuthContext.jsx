/**
 * Authentication Context
 * ======================
 * This provides authentication state and functions to the entire app.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. REACT CONTEXT: A way to share state without prop drilling.
 *    Wrap your app in a Provider, then use useContext anywhere.
 * 
 * 2. CUSTOM HOOK: useAuth() is a cleaner way to access the context.
 *    It also adds error checking if used outside the provider.
 * 
 * 3. LOADING STATE: We check for existing session on mount.
 *    This prevents the "flash of unauthenticated content" problem.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Create the context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state and functions.
 */
export function AuthProvider({ children }) {
    // Auth state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initial loading state
    const [authLoading, setAuthLoading] = useState(false); // For login/register actions

    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Check for existing session on mount
     * This runs once when the app loads
     */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await authAPI.getCurrentUser();
                if (response.data.success) {
                    setUser(response.data.data.user);
                }
            } catch (error) {
                // No session exists or it expired - that's fine
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    /**
     * Register a new user
     */
    const register = useCallback(async (data) => {
        setAuthLoading(true);
        try {
            const response = await authAPI.register(data);

            if (response.data.success) {
                setUser(response.data.data.user);
                toast.success('Welcome to Stashly! 🎉');

                // Redirect to dashboard or intended destination
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });

                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setAuthLoading(false);
        }
    }, [navigate, location]);

    /**
     * Login existing user
     */
    const login = useCallback(async (data) => {
        setAuthLoading(true);
        try {
            const response = await authAPI.login(data);

            if (response.data.success) {
                setUser(response.data.data.user);
                toast.success(`Welcome back, ${response.data.data.user.displayName}!`);

                // Redirect to dashboard or intended destination
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });

                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setAuthLoading(false);
        }
    }, [navigate, location]);

    /**
     * Logout user
     */
    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
            setUser(null);
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            // Even if the API fails, clear local state
            setUser(null);
            navigate('/login');
        }
    }, [navigate]);

    /**
     * Request password reset - sends 6-digit code to email
     */
    const forgotPassword = useCallback(async (email) => {
        setAuthLoading(true);
        try {
            const response = await authAPI.forgotPassword(email);
            if (response.data.success) {
                toast.success('Verification code sent to your email');
                return { success: true, devCode: response.data.devCode };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Request failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setAuthLoading(false);
        }
    }, []);

    /**
     * Verify 6-digit reset code
     */
    const verifyResetCode = useCallback(async (email, code) => {
        setAuthLoading(true);
        try {
            const response = await authAPI.verifyResetCode(email, code);
            if (response.data.success) {
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid code';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setAuthLoading(false);
        }
    }, []);

    /**
     * Reset password with email, code, and new password
     */
    const resetPassword = useCallback(async (email, code, password) => {
        setAuthLoading(true);
        try {
            await authAPI.resetPassword(email, code, password);
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Reset failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setAuthLoading(false);
        }
    }, [navigate]);

    // Context value - all the state and functions to share
    const value = {
        user,
        loading,
        authLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        forgotPassword,
        verifyResetCode,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth Hook
 * Use this to access auth state and functions in any component.
 * 
 * Usage:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default AuthContext;
