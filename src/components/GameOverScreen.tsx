'use client';

interface GameOverScreenProps {
  score: number;
  isVictory: boolean;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export function GameOverScreen({ score, isVictory, onPlayAgain, onMenu }: GameOverScreenProps) {
  // Calculate stars based on score
  const getStars = (score: number): number => {
    if (score >= 5000) return 3;
    if (score >= 2500) return 2;
    if (score >= 1000) return 1;
    return 0;
  };

  const stars = getStars(score);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        {/* Title */}
        <h1 className={`text-5xl md:text-6xl font-bold tracking-wider ${
          isVictory 
            ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]' 
            : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
        }`}>
          {isVictory ? 'VICTORY!' : 'GAME OVER'}
        </h1>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 text-4xl py-4" aria-label={`Rating: ${stars} out of 3 stars`}>
          {[1, 2, 3].map((star) => (
            <span
              key={star}
              className={star <= stars ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-gray-600'}
            >
              ★
            </span>
          ))}
        </div>

        {/* Score Summary */}
        <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-6">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
            Final Score
          </p>
          <p className="text-4xl font-mono text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {score.toLocaleString()}
          </p>
        </div>

        {/* Rating description */}
        <p className="text-gray-400 text-sm">
          {stars === 3 ? 'Perfect! Amazing performance!' :
           stars === 2 ? 'Great job! Keep it up!' :
           stars === 1 ? 'Good effort! Try again!' :
           'Keep practicing! You\'ll get there!'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 mt-8">
          <button
            onClick={onPlayAgain}
            className="w-full px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Play Again"
          >
            Play Again
          </button>

          <button
            onClick={onMenu}
            className="w-full px-8 py-4 bg-transparent border-2 border-fuchsia-400 text-fuchsia-400 hover:bg-fuchsia-400 hover:text-gray-900 font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Return to Main Menu"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
