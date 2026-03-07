'use client';

import { memo, useState, useEffect } from 'react';
import type { PowerUpType } from '@/types/game';

interface PowerUpIndicatorProps {
  activePowerUp: PowerUpType | null;
  powerUpEndTime: number | null;
}

const POWERUP_ICONS: Record<PowerUpType, { icon: string; color: string; label: string }> = {
  wide: {
    icon: '↔',
    color: 'var(--neon-cyan)',
    label: 'Wide',
  },
  multiball: {
    icon: '●●●',
    color: 'var(--neon-purple)',
    label: 'Multi',
  },
  laser: {
    icon: '↑↑',
    color: 'var(--neon-red)',
    label: 'Laser',
  },
};

export const PowerUpIndicator = memo(({ activePowerUp, powerUpEndTime }: PowerUpIndicatorProps) => {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!powerUpEndTime || !activePowerUp) {
      // Use a microtask to avoid synchronous setState during render
      queueMicrotask(() => setRemainingTime(0));
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((powerUpEndTime - now) / 1000));
      setRemainingTime(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [activePowerUp, powerUpEndTime]);

  if (!activePowerUp) {
    return null;
  }

  const powerUp = POWERUP_ICONS[activePowerUp];
  const showTimer = activePowerUp !== 'multiball' && remainingTime > 0;

  return (
    <div 
      className="powerup-indicator"
      style={{ '--powerup-color': powerUp.color } as React.CSSProperties}
    >
      <span className="powerup-icon">{powerUp.icon}</span>
      <div className="powerup-info">
        <span className="powerup-label">{powerUp.label}</span>
        {showTimer && (
          <span className="powerup-timer">{remainingTime}s</span>
        )}
      </div>
    </div>
  );
});

PowerUpIndicator.displayName = 'PowerUpIndicator';
