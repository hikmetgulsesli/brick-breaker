import { LEVEL_PATTERNS, BRICK_SCORES } from '@/types/game';

/**
 * Calculate maximum score for each level based on LEVEL_PATTERNS
 */
const levelMaxScores = LEVEL_PATTERNS.map(pattern =>
  pattern.flat().reduce((sum, brickType) => {
    return sum + (BRICK_SCORES[brickType as keyof typeof BRICK_SCORES] ?? 0);
  }, 0)
);

/**
 * Calculate cumulative maximum score up to a given level
 * @param level - 1-based level number
 * @returns Maximum possible score for levels 1 through the given level
 */
export const calculateCumulativeMaxScore = (level: number): number => {
  // level is 1-based, so we sum scores for levels 0 to level - 1
  return levelMaxScores.slice(0, level).reduce((sum, score) => sum + score, 0);
};

/**
 * Calculate star rating based on score percentage
 * 1 star: >30%, 2 stars: >60%, 3 stars: >90%
 * @param score - Current score
 * @param maxScore - Maximum possible score
 * @returns Number of stars (0-3)
 */
export const calculateStars = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  const percentage = score / maxScore;
  // Concise calculation: each threshold adds a star if met
  return Number(percentage > 0.3) + Number(percentage > 0.6) + Number(percentage > 0.9);
};

/**
 * Calculate lives bonus
 * 500 points per remaining life
 * @param lives - Number of remaining lives
 * @returns Bonus points
 */
export const calculateLivesBonus = (lives: number): number => {
  return lives * 500;
};
