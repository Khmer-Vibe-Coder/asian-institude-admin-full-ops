import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { authServiceMock } from '../services/auth.mock';
import en from '../locales/en/auth.json';

interface SearchParams {
  token?: string;
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      token: search.token as string | undefined,
    }
  },
  beforeLoad: () => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('aic.role')) {
      throw redirect({ to: '/admin' });
    }
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = en.resetPassword;

  useEffect(() => {
    // Optionally redirect if no token is present.
    // if (!search.token) {
    //   navigate({ to: '/login' });
    // }
  }, [search.token, navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await authServiceMock.resetPassword({
        token: search.token || '',
        newPassword,
        confirmPassword
      });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate({ to: '/login' }), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-200 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="size-16 mx-auto bg-[#d9a441] rounded-2xl flex items-center justify-center mb-6 shadow-md">
            <span className="text-white font-serif text-3xl font-bold">AIC</span>
          </div>
          <h1 className="text-2xl font-serif text-[#0f1b3d] font-bold mb-2">{t.title}</h1>
          <p className="text-slate-500 text-sm">{t.subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-sm text-center font-medium">
            Password updated successfully. Redirecting to login...
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t.newPassword}</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all placeholder:text-slate-400"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t.confirmPassword}</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all placeholder:text-slate-400"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2.5 px-4 mt-2 bg-[#0f1b3d] hover:bg-[#1a2b5e] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Updating...' : t.submitBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
