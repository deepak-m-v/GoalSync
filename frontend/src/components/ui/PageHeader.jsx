import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </motion.div>
  );
}
