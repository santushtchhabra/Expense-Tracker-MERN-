import { useState } from react;
import api from './api';

const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';
const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' ya 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isLogin = mode === 'login';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(isLogin ? '/auth/login' : '/auth/signup', payload);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Server se connect nahi ho paaya');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl shadow-lg shadow-indigo-200">
            💸
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Expense Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">All Your Expenses at One Place</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded-md py-2 transition ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Login' : 'Signup'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className={labelCls}>Name</label>
                <input name="name" placeholder="Rahul" value={form.name} onChange={handleChange} className={inputCls} required />
              </div>
            )}
            <div>
              <label className={labelCls}>Email</label>
              <input name="email" type="email" placeholder="rahul@example.com" value={form.email} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••"
                value={form.password}
                onChange={handleChange}
                minLength={mode === 'signup' ? 6 : undefined}
                className={inputCls}
                required
              />
              {mode === 'signup' && (
                <p className="mt-1.5 text-xs text-slate-500">Atleast 6 letters</p>
              )}
            </div>

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {loading ? 'Wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
