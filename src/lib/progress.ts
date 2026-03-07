/**
 * Local storage utility for tracking completed levels
 */

const COMPLETED_LEVELS_KEY = 'brick-breaker-completed-levels';

/**
 * Get array of completed level numbers from localStorage
 */
export function getCompletedLevels(): number[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(COMPLETED_LEVELS_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.filter(n => typeof n === 'number');
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Mark a level as completed
 */
export function markLevelCompleted(levelNumber: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const completed = getCompletedLevels();
    if (!completed.includes(levelNumber)) {
      completed.push(levelNumber);
      completed.sort((a, b) => a - b);
      localStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(completed));
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Check if a level is unlocked
 * Level 1 is always unlocked, others require previous level completion
 */
export function isLevelUnlocked(levelNumber: number): boolean {
  if (levelNumber === 1) return true;
  
  const completed = getCompletedLevels();
  return completed.includes(levelNumber - 1);
}

/**
 * Get the highest unlocked level number
 */
export function getHighestUnlockedLevel(): number {
  const completed = getCompletedLevels();
  
  // Start from level 1 (always unlocked)
  let highest = 1;
  
  // Check consecutive completed levels
  for (let i = 0; i < completed.length; i++) {
    if (completed[i] === highest) {
      highest++;
    }
  }
  
  return highest;
}

/**
 * Reset all progress (for testing)
 */
export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(COMPLETED_LEVELS_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
