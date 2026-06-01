import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { authServiceMock } from '../services/auth.mock';
import en from '../locales/en/auth.json';

interface SearchParams {
  email?: string;
}

export const Route = createFileRoute('/verify-otp')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      email: search.email as string | undefined,
    }
  },
  beforeLoad: () => {
    // Route commented out for now
    throw redirect({ to: '/login' });
  },
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const t = en.verifyOtp;

  useEffect(() => {
    if (!search.email) {
      navigate({ to: '/login' });
    }
  }, [search.email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authServiceMock.verifyOtp({ email: search.email || '', otp });
      if (res.success) {
        setSuccessMsg("Verification successful! Redirecting to login...");
        setTimeout(() => navigate({ to: '/login' }), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-deep hero-overlay p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gold mb-2">{t.title}</h1>
          <p className="text-muted-foreground font-sans">
            {t.subtitle}
            <br/>
            <span className="font-semibold text-foreground/80">{search.email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.otpLabel}</label>
            <input
              type="text"
              required
              maxLength={6}
              className="w-full px-4 py-3 text-center tracking-widest text-2xl rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 px-4 bg-gold hover:bg-gold-soft text-navy-deep font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '...' : t.submitBtn}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button className="text-gold hover:text-gold-soft transition-colors font-medium">
            {t.resend}
          </button>
        </div>
      </div>
    </div>
  );
}
