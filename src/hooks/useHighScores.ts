'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Score, HighScoresState } from '@/types/game';

const MAX_SCORES = 10;
const STORAGE_KEY = 'brick-breaker-high-scores';

export function useHighScores() {
  const [state, setState] = useLocalStorage<HighScoresState>(STORAGE_KEY, {
    scores: [],
  });

  const addScore = useCallback((score: number): void => {
    const newScore: Score = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      score,
      date: new Date().toISOString(),
    };

    setState((prev) => {
      const newScores = [...prev.scores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SCORES);
      
      return { scores: newScores };
    });
  }, [setState]);

  const clearScores = useCallback((): void => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to clear all high scores? This action cannot be undone.');
      if (confirmed) {
        setState({ scores: [] });
      }
    }
  }, [setState]);

  const getTopScores = useCallback((limit: number = MAX_SCORES): Score[] => {
    return state.scores.slice(0, limit);
  }, [state.scores]);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }, []);

  const isHighScore = useCallback((score: number): boolean => {
    if (state.scores.length < MAX_SCORES) return true;
    return score > state.scores[state.scores.length - 1].score;
  }, [state.scores]);

  return {
    scores: state.scores,
    addScore,
    clearScores,
    getTopScores,
    formatDate,
    isHighScore,
    hasScores: state.scores.length > 0,
  };
}
