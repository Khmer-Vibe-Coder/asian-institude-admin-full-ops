import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authServiceMock } from '../services/auth.mock';
import en from '../locales/en/auth.json';

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: () => {
    // Route commented out for now
    throw redirect({ to: '/login' });
  },
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = en.forgotPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authServiceMock.forgotPassword({ email });
      if (res.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Request failed');
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

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm">
              We have sent a password reset link to your email.
            </div>
            <Link to="/login" className="inline-block text-gold hover:text-gold-soft font-medium">
              {t.backToLogin}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t.emailLabel}</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gold hover:bg-gold-soft text-navy-deep font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : t.submitBtn}
            </button>
            
            <div className="text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.backToLogin}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
