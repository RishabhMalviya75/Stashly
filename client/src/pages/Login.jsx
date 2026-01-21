/**
 * Login Page
 * ==========
 * Meta/Facebook-inspired login form
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
    const { login, authLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        await login(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
            <div className="w-full max-w-md">
                {/* Logo & Tagline */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-500 mb-2">Stashly</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Your digital resource hub
                    </p>
                </div>

                {/* Login Card */}
                <div className="card p-6 sm:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className={`input pl-12 ${errors.email ? 'input-error' : ''}`}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Enter a valid email',
                                        },
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-error">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    className={`input pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
                                    {...register('password', {
                                        required: 'Password is required',
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-error">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={authLoading}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {authLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </button>

                        {/* Forgot Password Link */}
                        <div className="text-center">
                            <Link to="/forgot-password" className="btn-link">
                                Forgot password?
                            </Link>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="divider-text my-6">or</div>

                    {/* Create Account Button */}
                    <Link
                        to="/register"
                        className="btn-secondary w-full py-3 text-base bg-success hover:bg-success-dark text-white"
                    >
                        Create New Account
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-neutral-500 mt-6">
                    Stashly - Organize your digital resources
                </p>
            </div>
        </div>
    );
}
