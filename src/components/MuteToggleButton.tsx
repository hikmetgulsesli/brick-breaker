'use client';

interface MuteToggleButtonProps {
  isMuted: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Reusable mute toggle button component
 * Displays different icons based on muted state
 */
export const MuteToggleButton = ({ 
  isMuted, 
  onToggle, 
  size = 'md',
  className = '' 
}: MuteToggleButtonProps) => {
  const iconSize = size === 'sm' ? 16 : 20;
  const padding = size === 'sm' ? 'p-1' : 'p-2';
  const rounded = size === 'sm' ? 'rounded' : 'rounded-lg';
  
  return (
    <button
      onClick={onToggle}
      disabled={!onToggle}
      className={`${padding} ${rounded} border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--neon-cyan)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={isMuted ? 'Unmute' : 'Mute'}
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ color: 'var(--text-muted)' }}
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ color: 'var(--neon-cyan)' }}
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      )}
    </button>
  );
};
