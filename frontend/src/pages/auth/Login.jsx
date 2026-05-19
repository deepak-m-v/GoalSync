import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Target, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import Button from '../../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [microsoftEnabled, setMicrosoftEnabled] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/microsoft/config').then((res) => {
      setMicrosoftEnabled(Boolean(res.data.data?.enabled));
    }).catch(() => setMicrosoftEnabled(false));
  }, []);

  const signInWithMicrosoft = () => {
    const base = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${base}/auth/microsoft/login`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold text-white backdrop-blur">GS</div>
            <span className="text-2xl font-bold text-white">GoalSync AI</span>
          </div>
          <p className="mt-8 max-w-md text-lg text-emerald-50">
            Align teams, track quarterly progress, and govern goals with enterprise-grade clarity.
          </p>
        </motion.div>
        <div className="grid gap-4">
          {[
            { icon: Target, text: 'OKR-style goal sheets with weight validation' },
            { icon: TrendingUp, text: 'Quarterly check-ins & progress scoring' },
            { icon: Users, text: 'Manager approvals & HR analytics' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm text-white backdrop-blur"
            >
              <item.icon className="h-5 w-5" />
              {item.text}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#f8fafc] p-8 dark:bg-slate-950">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card w-full max-w-md space-y-6 p-8"
        >
          <motion.div className="lg:hidden">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">GS</div>
              <span className="text-xl font-bold">GoalSync</span>
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Use your organizational account</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Link to="/forgot-password" className="block text-sm text-emerald-600 hover:underline">Forgot password?</Link>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
          {microsoftEnabled && (
            <>
              <div className="relative py-2 text-center text-xs text-slate-400">
                <span className="bg-white px-2 dark:bg-slate-900">or</span>
              </div>
              <Button type="button" variant="secondary" className="w-full gap-2" onClick={signInWithMicrosoft}>
                <svg className="h-5 w-5" viewBox="0 0 21 21" aria-hidden>
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                Sign in with Microsoft
              </Button>
            </>
          )}
          <p className="text-center text-xs text-slate-400">
            Demo: employee@goalsync.com / Password123
            <br />
            <span className="text-slate-400">Uses Firebase when configured, else secure API login with JWT + refresh tokens.</span>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
