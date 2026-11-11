import { useEffect, useState } from "react";
import api from './api';

const CATEGORIES = {
  Food: { icon: '🍔', color: 'bg-orange-100' },
  Travel: { icon: '✈️', color: 'bg-sky-100' },
  Shopping: { icon: '🛍️', color: 'bg-pink-100' },
  Bills: { icon: '🧾', color: 'bg-violet-100' },
  Other: { icon: '📦', color: 'bg-slate-100' },
};

const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';
const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ title: '', amount: '', category: 'Food', date: today() });
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Expenses({ user, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Expenses load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      setForm(emptyForm());
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Kuch galat ho gaya');
    }
  };

  const startEdit = (x) => {
    setEditingId(x._id);
    setForm({
      title: x.title,
      amount: x.amount,
      category: x.category,
      date: x.date.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ye expense delete kar dein?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete nahi hua');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg">💸</div>
            <span className="font-semibold text-slate-900">Expense Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">{user.email}</span>
            <button
              onClick={onLogout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Namaste, {user.name} Ji 👋</h1>

        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl border bg-white p-5 shadow-sm transition sm:p-6 ${
            editingId ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'
          }`}
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? '✏️ Expense edit karo' : 'Naya expense'}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Title</label>
              <input name="title" placeholder="GROCERY" value={form.title} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Amount (₹)</label>
              <input name="amount" type="number" min="0" step="10" placeholder="0" value={form.amount} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                {Object.keys(CATEGORIES).map((c) => (
                  <option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className={inputCls} required />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
              {editingId ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">My Expenses</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {expenses.length}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mb-2 text-4xl">🪙</div>
              <p className="font-medium text-slate-700">No Expenses Added Yet</p>
              <p className="text-sm text-slate-500">Add Expenses From Above</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {expenses.map((x) => {
                const cat = CATEGORIES[x.category] || CATEGORIES.Other;
                return (
                  <li key={x._id} className="flex items-center gap-3 py-3.5 sm:gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${cat.color}`}>
                      {cat.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{x.title}</p>
                      <p className="text-xs text-slate-500">{x.category} · {formatDate(x.date)}</p>
                    </div>
                    <p className="font-semibold text-slate-900">₹{Number(x.amount).toLocaleString('en-IN')}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(x)}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(x._id)}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
