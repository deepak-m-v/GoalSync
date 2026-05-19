const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button type="button" className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
