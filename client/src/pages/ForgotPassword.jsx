/**
 * Forgot Password Page
 * ====================
 * Meta/Facebook-inspired password reset flow
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const { forgotPassword, authLoading } = useAuth();
    const [emailSent, setEmailSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm();

    const onSubmit = async (data) => {
        const result = await forgotPassword(data.email);
        if (result.success) {
            setEmailSent(true);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
                <div className="w-full max-w-md">
                    <div className="card p-8 text-center">
                        <div className="w-16 h-16 bg-success-light dark:bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Check your email</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            We sent password reset instructions to{' '}
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                {getValues('email')}
                            </span>
                        </p>
                        <Link to="/login" className="btn-primary w-full py-3">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
            <div className="w-full max-w-md">
                {/* Back to Login */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>

                {/* Card */}
                <div className="card p-6 sm:p-8">
                    <h2 className="text-xl font-semibold mb-2">Reset your password</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        Enter your email and we&apos;ll send you instructions to reset your password.
                    </p>

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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={authLoading}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {authLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Instructions'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
