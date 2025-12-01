import { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'small';
  icon?: ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'default',
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={clsx(
        // 基础样式
        'glass-button font-playfair text-text-primary tracking-wider uppercase',
        'transition-all duration-500 ease-in-out',
        'hover:border-soul-gold hover:bg-soul-gold/5',
        'flex items-center gap-4',
        
        // 变体样式
        {
          'px-11 py-4 text-sm': variant === 'default',
          'px-6 py-2 text-xs rounded-full bg-black/60 backdrop-blur-md': variant === 'small',
        },
        
        className
      )}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="font-noto-serif">{children}</span>
    </button>
  );
};