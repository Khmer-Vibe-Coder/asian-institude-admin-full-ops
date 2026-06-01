import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authServiceMock } from '../services/auth.mock';
import en from '../locales/en/auth.json';

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('aic.role')) {
      throw redirect({ to: '/admin' });
    }
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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-4 py-12 font-sans">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl border border-slate-200 shadow-xl relative z-10">
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

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t.firstName}</label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t.lastName}</label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t.emailLabel}</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all placeholder:text-slate-400"
              placeholder="admin@asianinstitute.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t.phoneLabel}</label>
            <input
              type="tel"
              name="phone"
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all placeholder:text-slate-400"
              placeholder="+855 ..."
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t.passwordLabel}</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all placeholder:text-slate-400"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t.confirmPassword}</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all placeholder:text-slate-400"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-2 bg-[#0f1b3d] hover:bg-[#1a2b5e] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Creating account...' : t.submitBtn}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {t.hasAccount}{" "}
          <Link to="/login" className="text-[#d9a441] hover:text-[#c29135] font-medium transition-colors">
            {t.loginLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
