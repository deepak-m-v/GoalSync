import Card from '../ui/Card';

export default function ChartShell({ title, subtitle, children, className = '' }) {
  return (
    <Card className={className}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </Card>
  );
}
