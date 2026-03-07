'use client';

import { memo } from 'react';
import { ScoreDisplay } from './ScoreDisplay';
import { LifeCounter } from './LifeCounter';
import { LevelIndicator } from './LevelIndicator';
import { PowerUpIndicator } from './PowerUpIndicator';
import type { PowerUpType } from '@/types/game';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
  activePowerUp: PowerUpType | null;
  powerUpEndTime?: number | null;
}

export const HUD = memo(({ 
  score, 
  lives, 
  level, 
  activePowerUp,
  powerUpEndTime = null 
}: HUDProps) => {
  return (
    <div className="hud-overlay">
      {/* Top Bar - Score, Level, Lives */}
      <div className="hud-top-bar">
        <div className="hud-left">
          <ScoreDisplay score={score} />
        </div>
        
        <div className="hud-center">
          <LevelIndicator level={level} />
        </div>
        
        <div className="hud-right">
          <LifeCounter lives={lives} />
        </div>
      </div>
      
      {/* Bottom Bar - PowerUp Indicator */}
      {activePowerUp && (
        <div className="hud-bottom-bar">
          <div className="hud-bottom-left">
            <PowerUpIndicator 
              activePowerUp={activePowerUp} 
              powerUpEndTime={powerUpEndTime} 
            />
          </div>
        </div>
      )}
    </div>
  );
});

HUD.displayName = 'HUD';
