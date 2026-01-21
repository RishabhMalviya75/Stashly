/**
 * Register Page
 * =============
 * Meta/Facebook-inspired registration form
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';

export default function Register() {
    const { register: registerUser, authLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        await registerUser(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4 py-8">
            <div className="w-full max-w-md">
                {/* Back to Login */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>

                {/* Logo & Tagline */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-500 mb-2">Stashly</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Create your account
                    </p>
                </div>

                {/* Register Card */}
                <div className="card p-6 sm:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Display Name Field */}
                        <div>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    className={`input pl-12 ${errors.displayName ? 'input-error' : ''}`}
                                    {...register('displayName', {
                                        required: 'Name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Name must be at least 2 characters',
                                        },
                                        maxLength: {
                                            value: 50,
                                            message: 'Name cannot exceed 50 characters',
                                        },
                                    })}
                                />
                            </div>
                            {errors.displayName && (
                                <p className="mt-1.5 text-sm text-error">{errors.displayName.message}</p>
                            )}
                        </div>

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
                                    placeholder="Password (min 8 characters)"
                                    className={`input pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
                                        pattern: {
                                            value: /^(?=.*[A-Za-z])(?=.*\d)/,
                                            message: 'Password must contain a letter and a number',
                                        },
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
                            className="btn-primary w-full py-3 text-base bg-success hover:bg-success-dark"
                        >
                            {authLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>

                        {/* Terms */}
                        <p className="text-xs text-neutral-500 text-center">
                            By signing up, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </form>
                </div>

                {/* Login Link */}
                <p className="text-center text-neutral-600 dark:text-neutral-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="link font-semibold">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
