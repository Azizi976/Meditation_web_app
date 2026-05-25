import { cn } from '../../utils/cn';

const colors = {
  lavender: 'bg-lavender-100 text-lavender-700',
  sage:     'bg-sage-100 text-sage-700',
  blush:    'bg-blush-100 text-blush-700',
  sand:     'bg-sand-100 text-sand-700',
  sky:      'bg-sky-100 text-sky-700',
};

export default function Badge({ color = 'lavender', className, children }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color], className)}>
      {children}
    </span>
  );
}
