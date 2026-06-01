import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authServiceMock } from '../services/auth.mock';
import en from '../locales/en/auth.json';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('aic.role')) {
      throw redirect({ to: '/admin' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = en.login;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authServiceMock.login({ email, password });
      if (res.success) {
        localStorage.setItem('aic.role', res.data.role);
        navigate({ to: '/admin' });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
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

        <form onSubmit={handleLogin} className="space-y-6">
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
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground/80">{t.passwordLabel}</label>
              <Link to="/forgot-password" className="text-sm text-gold hover:text-gold-soft transition-colors">
                {t.forgotPasswordLink}
              </Link>
            </div>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gold hover:bg-gold-soft text-navy-deep font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '...' : t.submitBtn}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t.noAccount}{" "}
          <Link to="/register" className="text-gold hover:text-gold-soft font-medium">
            {t.registerLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
