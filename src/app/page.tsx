'use client';

import { useState, useCallback, useEffect } from 'react';
import { MainMenu, HighScores, GameCanvas, PauseOverlay, GameOverScreen } from '@/components';
import { useHighScores } from '@/hooks';
import type { GameScreen } from '@/types/game';

export default function Home() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const { scores, addScore, clearScores, formatDate, hasScores } = useHighScores();

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'game' && !isPaused) {
        setIsPaused(true);
      } else if (e.key === 'Escape' && screen === 'game' && isPaused) {
        setIsPaused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPaused]);

  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setIsPaused(false);
    setIsVictory(false);
    setScreen('game');
  }, []);

  const showHighScores = useCallback(() => {
    setScreen('high-scores');
  }, []);

  const showMenu = useCallback(() => {
    setIsPaused(false);
    setScreen('menu');
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    addScore(finalScore);
    setIsVictory(false);
    setScreen('game-over');
  }, [addScore]);

  const handleVictory = useCallback((finalScore: number) => {
    addScore(finalScore);
    setIsVictory(true);
    setScreen('game-over');
  }, [addScore]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setIsPaused(false);
    setScreen('game');
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case 'menu':
        return (
          <MainMenu
            onStartGame={startGame}
            onShowHighScores={showHighScores}
          />
        );

      case 'high-scores':
        return (
          <HighScores
            scores={scores}
            formatDate={formatDate}
            onClearScores={clearScores}
            onBack={showMenu}
            hasScores={hasScores}
          />
        );

      case 'game':
        return (
          <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <GameCanvas
              onGameOver={handleGameOver}
              onVictory={handleVictory}
              onPause={handlePause}
              isPaused={isPaused}
              score={score}
              setScore={setScore}
              level={level}
              lives={lives}
              setLives={setLives}
            />
            {isPaused && (
              <PauseOverlay
                onResume={handleResume}
                onRestart={handleRestart}
                onMenu={showMenu}
              />
            )}
          </div>
        );

      case 'game-over':
        return (
          <GameOverScreen
            score={score}
            isVictory={isVictory}
            onPlayAgain={startGame}
            onMenu={showMenu}
          />
        );

      default:
        return <MainMenu onStartGame={startGame} onShowHighScores={showHighScores} />;
    }
  };

  return (
    <main className="min-h-screen">
      {renderScreen()}
    </main>
  );
}
