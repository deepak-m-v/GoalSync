import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('If an account exists, a reset link has been sent.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-8 dark:bg-slate-950">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card w-full max-w-md space-y-6 p-8"
      >
        <div>
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="mt-1 text-sm text-slate-500">We will email you a reset link</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input type="email" className="input-field" required placeholder="you@company.com" />
        </div>
        <Button type="submit" className="w-full">Send reset link</Button>
        <Link to="/login" className="block text-center text-sm text-emerald-600 hover:underline">Back to sign in</Link>
      </motion.form>
    </div>
  );
}
