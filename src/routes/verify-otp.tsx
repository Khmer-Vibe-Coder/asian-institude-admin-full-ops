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
    if (typeof localStorage !== 'undefined' && localStorage.getItem('aic.role')) {
      throw redirect({ to: '/admin' });
    }
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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-200 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="size-16 mx-auto bg-[#d9a441] rounded-2xl flex items-center justify-center mb-6 shadow-md">
            <span className="text-white font-serif text-3xl font-bold">AIC</span>
          </div>
          <h1 className="text-2xl font-serif text-[#0f1b3d] font-bold mb-2">{t.title}</h1>
          <p className="text-slate-500 text-sm">
            {t.subtitle}
            <br/>
            <span className="font-semibold text-slate-800">{search.email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-sm text-center font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t.otpLabel}</label>
            <input
              type="text"
              required
              maxLength={6}
              className="w-full px-4 py-3 text-center tracking-widest text-2xl rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-[#d9a441] focus:ring-1 focus:ring-[#d9a441] outline-none transition-all placeholder:text-slate-300"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-2.5 px-4 mt-2 bg-[#0f1b3d] hover:bg-[#1a2b5e] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Verifying...' : t.submitBtn}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <button className="text-[#d9a441] hover:text-[#c29135] font-medium transition-colors">
            {t.resend}
          </button>
        </div>
      </div>
    </div>
  );
}
