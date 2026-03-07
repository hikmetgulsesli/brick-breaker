'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glowOnHover?: boolean;
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    glowOnHover = true,
    className = '', 
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'neon-button';
    
    const variantStyles = {
      primary: 'neon-button-cyan',
      secondary: 'neon-button-pink',
      success: 'neon-button-green',
      danger: 'neon-button-red'
    };
    
    const sizeStyles = {
      sm: 'neon-button-sm',
      md: 'neon-button-md',
      lg: 'neon-button-lg'
    };
    
    const glowClass = glowOnHover ? 'neon-button-glow' : '';
    
    const combinedClass = [baseStyles, variantStyles[variant], sizeStyles[size], glowClass, className].filter(Boolean).join(' ');
    
    return (
      <button 
        ref={ref}
        className={combinedClass}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeonButton.displayName = 'NeonButton';
