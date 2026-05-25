import { cn } from '../../utils/cn';

export default function Spinner({ className }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="w-8 h-8 border-3 border-lavender-200 border-t-lavender-500 rounded-full animate-spin" />
    </div>
  );
}
