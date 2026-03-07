'use client';

import { useMemo } from 'react';
import { LEVELS, LevelConfig } from '../entities/levels';
import { isLevelUnlocked, getCompletedLevels } from '../lib/progress';
import { BRICK_COLORS } from '../entities/Brick';

export interface LevelSelectorProps {
  /** Callback when a level is selected */
  onSelectLevel: (levelNumber: number) => void;
  /** Callback when back button is clicked */
  onBack: () => void;
}

/**
 * Level preview thumbnail component showing brick pattern
 */
function LevelPreview({ levelConfig, isLocked }: { levelConfig: LevelConfig; isLocked: boolean }) {
  const { grid, rows, cols } = levelConfig.pattern;
  const cellSize = 8;
  const gap = 1;
  const width = cols * (cellSize + gap) - gap;
  const height = rows * (cellSize + gap) - gap;

  return (
    <div 
      className={`relative rounded-lg overflow-hidden ${isLocked ? 'opacity-40' : ''}`}
      style={{ width, height }}
    >
      {grid.map((row, rowIndex) =>
        row.map((durability, colIndex) => {
          if (durability === 0) return null;
          
          const colors = BRICK_COLORS[durability as keyof typeof BRICK_COLORS];
          if (!colors) {
            return null;
          }
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="absolute"
              style={{
                left: colIndex * (cellSize + gap),
                top: rowIndex * (cellSize + gap),
                width: cellSize,
                height: cellSize,
                backgroundColor: colors.fill,
                boxShadow: `0 0 4px ${colors.glow}`,
                borderRadius: 1,
              }}
            />
          );
        })
      )}
    </div>
  );
}

/**
 * Lock icon component
 */
function LockIcon() {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      className="text-[#ff3864]"
    >
      <path 
        d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Level card component
 */
function LevelCard({
  levelConfig,
  isUnlocked,
  isCompleted,
  onSelect,
}: {
  levelConfig: LevelConfig;
  isUnlocked: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={!isUnlocked}
      className={`
        relative group flex flex-col items-center gap-4 p-6 rounded-xl border-2
        transition-all duration-300 ease-out
        ${isUnlocked 
          ? 'border-[#00ff41] bg-[#00ff41]/5 hover:bg-[#00ff41]/10 hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] cursor-pointer' 
          : 'border-[#ff3864]/30 bg-[#ff3864]/5 cursor-not-allowed'
        }
      `}
    >
      {/* Level Number */}
      <div className={`
        text-2xl font-bold font-mono
        ${isUnlocked ? 'text-[#00ff41]' : 'text-[#ff3864]/50'}
      `}>
        Level {levelConfig.levelNumber}
      </div>

      {/* Level Name */}
      <div className={`
        text-sm uppercase tracking-wider
        ${isUnlocked ? 'text-white/70' : 'text-white/30'}
      `}>
        {levelConfig.name}
      </div>

      {/* Preview Thumbnail */}
      <div className="relative my-4">
        <LevelPreview levelConfig={levelConfig} isLocked={!isUnlocked} />
        
        {/* Lock Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 rounded-full bg-black/60 backdrop-blur-sm">
              <LockIcon />
            </div>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mt-auto">
        {isCompleted ? (
          <span className="px-3 py-1 text-xs font-mono rounded-full bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/30">
            COMPLETED
          </span>
        ) : isUnlocked ? (
          <span className="px-3 py-1 text-xs font-mono rounded-full bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/30">
            PLAY
          </span>
        ) : (
          <span className="px-3 py-1 text-xs font-mono rounded-full bg-[#ff3864]/20 text-[#ff3864] border border-[#ff3864]/30">
            LOCKED
          </span>
        )}
      </div>

      {/* Glow effect for unlocked */}
      {isUnlocked && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#00ff41]/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

/**
 * Level Selector screen component
 * Displays level cards in a responsive grid layout
 */
export function LevelSelector({ onSelectLevel, onBack }: LevelSelectorProps) {
  // Use useMemo to calculate level states once on mount, avoiding setState in effect
  const levelStates = useMemo(() => {
    // Check unlocked status for all levels
    const unlocked = new Set<number>();
    const completed = new Set<number>(getCompletedLevels());
    
    LEVELS.forEach(level => {
      if (isLevelUnlocked(level.levelNumber)) {
        unlocked.add(level.levelNumber);
      }
    });
    
    return { unlocked, completed };
  }, []);

  const unlockedLevels = levelStates.unlocked;
  const completedLevels = levelStates.completed;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="relative flex items-center justify-center px-6 py-4 border-b border-[#00ff41]/20">
        <button
          onClick={onBack}
          className="absolute left-6 flex items-center gap-2 px-4 py-2 text-sm font-mono text-white/70 hover:text-[#00ff41] transition-colors rounded-lg border border-transparent hover:border-[#00ff41]/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          BACK
        </button>
        
        <h1 className="text-xl md:text-2xl font-bold font-mono text-[#00ff41] tracking-wider" style={{ textShadow: '0 0 20px rgba(0,255,65,0.5)' }}>
          SELECT LEVEL
        </h1>
      </header>

      {/* Level Grid */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {LEVELS.map((level) => (
            <LevelCard
              key={level.levelNumber}
              levelConfig={level}
              isUnlocked={unlockedLevels.has(level.levelNumber)}
              isCompleted={completedLevels.has(level.levelNumber)}
              onSelect={() => onSelectLevel(level.levelNumber)}
            />
          ))}
        </div>
      </main>

      {/* Footer hint */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-white/30 font-mono">
          Complete each level to unlock the next
        </p>
      </footer>
    </div>
  );
}


