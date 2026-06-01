import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authServiceMock } from '../services/auth.mock';
import en from '../locales/en/auth.json';

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    // Route commented out for now
    throw redirect({ to: '/login' });
  },
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = en.register;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authServiceMock.register(formData);
      if (res.success) {
        navigate({ to: '/verify-otp', search: { email: formData.email } });
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-deep hero-overlay p-4 py-12">
      <div className="glass-card w-full max-w-lg p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gold mb-2">{t.title}</h1>
          <p className="text-muted-foreground font-sans">{t.subtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t.firstName}</label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t.lastName}</label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.emailLabel}</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.phoneLabel}</label>
            <input
              type="tel"
              name="phone"
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.passwordLabel}</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.confirmPassword}</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-4 bg-gold hover:bg-gold-soft text-navy-deep font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '...' : t.submitBtn}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t.hasAccount}{" "}
          <Link to="/login" className="text-gold hover:text-gold-soft font-medium">
            {t.loginLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
