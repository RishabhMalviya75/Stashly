/**
 * Forgot Password Page
 * ====================
 * Multi-step password reset flow with email verification code
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader2, ArrowLeft, CheckCircle, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
    const { forgotPassword, verifyResetCode, resetPassword, authLoading } = useAuth();
    const [step, setStep] = useState(1); // 1: email, 2: code, 3: password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const codeInputs = useRef([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const password = watch('password');

    // Handle email submission (Step 1)
    const onSubmitEmail = async (data) => {
        setEmail(data.email);
        const result = await forgotPassword(data.email);
        if (result.success) {
            setStep(2);
            // In development, show the code in console
            if (result.devCode) {
                console.log('DEV: Reset code is:', result.devCode);
            }
        }
    };

    // Handle code input
    const handleCodeChange = (index, value) => {
        if (value.length > 1) {
            // Handle paste
            const digits = value.replace(/\D/g, '').slice(0, 6);
            const newCode = [...code];
            digits.split('').forEach((digit, i) => {
                if (index + i < 6) {
                    newCode[index + i] = digit;
                }
            });
            setCode(newCode);
            const nextIndex = Math.min(index + digits.length, 5);
            codeInputs.current[nextIndex]?.focus();
        } else {
            const digit = value.replace(/\D/g, '');
            const newCode = [...code];
            newCode[index] = digit;
            setCode(newCode);
            if (digit && index < 5) {
                codeInputs.current[index + 1]?.focus();
            }
        }
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            codeInputs.current[index - 1]?.focus();
        }
    };

    // Handle code verification (Step 2)
    const onVerifyCode = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) return;

        const result = await verifyResetCode(email, fullCode);
        if (result.success) {
            setStep(3);
        }
    };

    // Auto-verify when all 6 digits are entered
    useEffect(() => {
        if (code.every(d => d) && code.length === 6) {
            // Small delay to show the last digit
            const timer = setTimeout(() => {
                onVerifyCode();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [code]);

    // Handle password reset (Step 3)
    const onResetPassword = async (data) => {
        const fullCode = code.join('');
        await resetPassword(email, fullCode, data.password);
    };

    // Step 1: Enter Email
    if (step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
                <div className="w-full max-w-md">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>

                    <div className="card p-6 sm:p-8">
                        <h2 className="text-xl font-semibold mb-2">Reset your password</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            Enter your email and we&apos;ll send you a verification code.
                        </p>

                        <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
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
                                    'Send Verification Code'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Enter Verification Code
    if (step === 2) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
                <div className="w-full max-w-md">
                    <button
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Change email
                    </button>

                    <div className="card p-6 sm:p-8">
                        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-center">Enter verification code</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-center">
                            We sent a 6-digit code to<br />
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">{email}</span>
                        </p>

                        <div className="flex justify-center gap-2 mb-6">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => codeInputs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-semibold border-2 border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-neutral-800 transition-all"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <button
                            onClick={onVerifyCode}
                            disabled={authLoading || code.some(d => !d)}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {authLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Code'
                            )}
                        </button>

                        <p className="text-center text-sm text-neutral-500 mt-4">
                            Didn&apos;t receive the code?{' '}
                            <button
                                onClick={() => forgotPassword(email)}
                                disabled={authLoading}
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Enter New Password
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
            <div className="w-full max-w-md">
                <div className="card p-6 sm:p-8">
                    <div className="w-14 h-14 bg-success-light dark:bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-7 h-7 text-success" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-center">Create new password</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-center">
                        Your identity has been verified. Set your new password.
                    </p>

                    <form onSubmit={handleSubmit(onResetPassword)} className="space-y-4">
                        {/* Password Field */}
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="New password"
                                    className={`input pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-zA-Z])(?=.*\d)/,
                                            message: 'Password must contain a letter and a number',
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-error">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    className={`input pl-12 pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: value => value === password || 'Passwords do not match',
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1.5 text-sm text-error">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {authLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
