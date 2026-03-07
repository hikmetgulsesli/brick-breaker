import { BRICK_SCORES, LEVEL_PATTERNS } from '@/types/game';

/**
 * Calculate maximum possible score for a single level based on LEVEL_PATTERNS
 * This is dynamic and will update if LEVEL_PATTERNS changes
 */
export const calculateLevelMaxScore = (levelIndex: number): number => {
  const pattern = LEVEL_PATTERNS[levelIndex];
  if (!pattern) return 0;
  
  let score = 0;
  for (const row of pattern) {
    for (const brickLevel of row) {
      if (brickLevel > 0) {
        score += BRICK_SCORES[brickLevel as keyof typeof BRICK_SCORES] || 0;
      }
    }
  }
  return score;
};

/**
 * Calculate maximum possible score for all levels up to and including the given level
 */
export const calculateMaxScoreForLevel = (level: number): number => {
  let total = 0;
  for (let i = 0; i < level && i < LEVEL_PATTERNS.length; i++) {
    total += calculateLevelMaxScore(i);
  }
  return total;
};

/**
 * Calculate maximum possible score for all 3 levels (victory)
 */
export const calculateTotalMaxScore = (): number => {
  return LEVEL_PATTERNS.reduce((sum, _, index) => sum + calculateLevelMaxScore(index), 0);
};

/**
 * Calculate star rating based on score percentage
 * 1 star: >30%, 2 stars: >60%, 3 stars: >90%
 */
export const calculateStars = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  const percentage = score / maxScore;
  if (percentage > 0.9) return 3;
  if (percentage > 0.6) return 2;
  if (percentage > 0.3) return 1;
  return 0;
};

/**
 * Calculate lives bonus (500 points per remaining life)
 */
export const calculateLivesBonus = (lives: number): number => {
  return lives * 500;
};
