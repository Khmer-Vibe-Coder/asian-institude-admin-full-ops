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
    // Route commented out for now
    throw redirect({ to: '/login' });
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
    <div className="min-h-screen flex items-center justify-center bg-navy-deep hero-overlay p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gold mb-2">{t.title}</h1>
          <p className="text-muted-foreground font-sans">{t.subtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm text-center">
            Password updated successfully. Redirecting to login...
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.newPassword}</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.confirmPassword}</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 px-4 bg-gold hover:bg-gold-soft text-navy-deep font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '...' : t.submitBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
