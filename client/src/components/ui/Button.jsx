import { cn } from '../../utils/cn';

const variants = {
  primary:  'bg-lavender-500 hover:bg-lavender-600 text-white shadow-lg shadow-lavender-200',
  secondary:'bg-white/70 hover:bg-white text-lavender-700 border border-lavender-200',
  ghost:    'hover:bg-white/50 text-slate-600',
  danger:   'bg-blush-500 hover:bg-blush-600 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-medium',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lavender-400 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
