'use client';

import React, { useState } from 'react';
import { X, Shield, User, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register, resetPassword, loginAsAdmin, loginAsCustomer } = useStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('1234');
  const [codeSent, setCodeSent] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authMode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password, phone);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed.');
      } else {
        setSuccessMsg('Account registered successfully!');
        setTimeout(() => onClose(), 800);
      }
    } else if (authMode === 'forgot_password') {
      if (!email.trim()) {
        setError('Please enter your registered email address.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('New password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const res = await resetPassword(email, password, resetCode);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Password reset failed.');
      } else {
        setSuccessMsg(res.message || 'Password updated successfully! You can now log in.');
        setTimeout(() => {
          setAuthMode('login');
          setSuccessMsg('');
          setPassword('');
        }, 1500);
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Login failed.');
      } else {
        setSuccessMsg('Welcome back!');
        setTimeout(() => onClose(), 800);
      }
    }
  };

  const handleAdminDemo = () => {
    loginAsAdmin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-md border border-neutral-200 shadow-2xl p-6 sm:p-8 z-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
            Account Access
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mt-1">
            {authMode === 'register'
              ? 'Create an Account'
              : authMode === 'forgot_password'
              ? 'Reset Your Password'
              : 'Welcome to CustomWear BD'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {authMode === 'forgot_password'
              ? 'Enter your registered email and choose a new password.'
              : 'Sign in to track orders, manage your wishlist, and check out faster.'}
          </p>
        </div>

        {/* Demo Fast Buttons (Shown on login & register) */}
        {authMode !== 'forgot_password' && (
          <div className="mb-6 p-3 bg-neutral-50 border border-neutral-200 flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
              Instant Test Logins:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdminDemo}
                className="flex-1 py-1.5 px-2 bg-black text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-neutral-800"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsCustomer('Tanvir Hossain', 'customer@gmail.com');
                  onClose();
                }}
                className="flex-1 py-1.5 px-2 bg-white text-neutral-900 border border-neutral-300 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:border-black"
              >
                <User className="w-3.5 h-3.5" />
                Demo Customer
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanvir Hossain"
                className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none"
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Phone Number (Bangladesh)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                {authMode === 'forgot_password' ? 'New Password' : 'Password'} <span className="text-red-500">*</span>
              </label>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot_password');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-neutral-500 hover:text-black underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none"
            />
          </div>

          {authMode === 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Security Reset Code
                </label>
                <button
                  type="button"
                  onClick={() => setCodeSent(true)}
                  className="text-[10px] text-black font-semibold uppercase underline"
                >
                  {codeSent ? 'Code Sent (Demo: 1234)' : 'Send Code'}
                </button>
              </div>
              <input
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Enter 4-digit code (Demo: 1234)"
                className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Please wait...'
                : authMode === 'register'
                ? 'Register'
                : authMode === 'forgot_password'
                ? 'Update Password'
                : 'Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500 border-t border-neutral-100 pt-4">
          {authMode === 'register' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className="font-bold text-black underline"
              >
                Sign In
              </button>
            </p>
          ) : authMode === 'forgot_password' ? (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className="font-bold text-black underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                }}
                className="font-bold text-black underline"
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
