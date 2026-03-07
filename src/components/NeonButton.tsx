/**
 * Neon Button Component
 * 
 * Reusable button with retro neon glow effect.
 * Used across MainMenu, GameOverlay, and other components.
 */

'use client';

export interface NeonButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
}

export function NeonButton({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className = ''
}: NeonButtonProps) {
  const getColors = () => {
    if (disabled) return { bg: '#444', glow: 'transparent', text: '#666' };
    switch (variant) {
      case 'primary': return { bg: '#00ff41', glow: 'rgba(0, 255, 65, 0.5)', text: '#00ff41' };
      case 'secondary': return { bg: '#00d4ff', glow: 'rgba(0, 212, 255, 0.5)', text: '#00d4ff' };
      case 'danger': return { bg: '#ff3864', glow: 'rgba(255, 56, 100, 0.5)', text: '#ff3864' };
      case 'success': return { bg: '#ffd700', glow: 'rgba(255, 215, 0, 0.5)', text: '#ffd700' };
      default: return { bg: '#00d4ff', glow: 'rgba(0, 212, 255, 0.5)', text: '#00d4ff' };
    }
  };

  const colors = getColors();

  return (
    <>
      <style jsx>{`
        .neon-button {
          padding: 16px 40px;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: 2px solid ${colors.bg};
          background: ${disabled ? '#222' : 'transparent'};
          color: ${disabled ? '#666' : colors.text};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          border-radius: 4px;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
          min-width: 220px;
        }

        .neon-button:not(:disabled):hover {
          background: ${colors.bg};
          color: #000;
          box-shadow: 0 0 20px ${colors.glow}, 0 0 40px ${colors.glow};
          transform: translateY(-2px);
        }

        .neon-button:not(:disabled):active {
          transform: translateY(0);
        }

        .neon-button.small {
          padding: 14px 32px;
          font-size: 16px;
          letter-spacing: 2px;
          min-width: 180px;
        }
      `}</style>
      <button
        className={`neon-button ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </>
  );
}

export default NeonButton;
