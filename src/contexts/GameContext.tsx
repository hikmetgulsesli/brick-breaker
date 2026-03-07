'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface GameContextType {
  selectedLevel: number;
  setSelectedLevel: (level: number) => void;
  lastGameScore: number | null;
  setLastGameScore: (score: number | null) => void;
  lastGameLevel: number | null;
  setLastGameLevel: (level: number | null) => void;
  clearGameState: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLevel, setSelectedLevelState] = useState(1);
  const [lastGameScore, setLastGameScore] = useState<number | null>(null);
  const [lastGameLevel, setLastGameLevel] = useState<number | null>(null);

  const setSelectedLevel = useCallback((level: number) => {
    setSelectedLevelState(level);
  }, []);

  const clearGameState = useCallback(() => {
    setLastGameScore(null);
    setLastGameLevel(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        selectedLevel,
        setSelectedLevel,
        lastGameScore,
        setLastGameScore,
        lastGameLevel,
        setLastGameLevel,
        clearGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
