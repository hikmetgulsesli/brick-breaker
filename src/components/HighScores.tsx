'use client';

import type { Score } from '@/types/game';

interface HighScoresProps {
  scores: Score[];
  formatDate: (dateString: string) => string;
  onClearScores: () => void;
  onBack: () => void;
  hasScores: boolean;
}

export function HighScores({ scores, formatDate, onClearScores, onBack, hasScores }: HighScoresProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-lg">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
          HIGH SCORES
        </h1>

        {/* Score Board */}
        <div className="border-2 border-yellow-400/50 rounded-lg overflow-hidden bg-gray-800/80 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 p-4 bg-yellow-400/20 border-b border-yellow-400/50">
            <div className="col-span-2 text-center text-yellow-400 font-bold text-sm uppercase tracking-wider">
              Rank
            </div>
            <div className="col-span-5 text-left text-yellow-400 font-bold text-sm uppercase tracking-wider">
              Score
            </div>
            <div className="col-span-5 text-right text-yellow-400 font-bold text-sm uppercase tracking-wider">
              Date
            </div>
          </div>

          {/* Score List */}
          <div className="max-h-[400px] overflow-y-auto">
            {hasScores ? (
              scores.map((score, index) => (
                <div
                  key={score.id}
                  className={`grid grid-cols-12 gap-2 p-4 border-b border-gray-700 last:border-b-0 transition-colors hover:bg-gray-700/50 ${
                    index === 0 ? 'bg-yellow-400/10' : ''
                  }`}
                >
                  <div className="col-span-2 text-center">
                    {index === 0 ? (
                      <span className="text-2xl" aria-label="First place">👑</span>
                    ) : index === 1 ? (
                      <span className="text-xl" aria-label="Second place">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-xl" aria-label="Third place">🥉</span>
                    ) : (
                      <span className="text-gray-400 font-mono">#{index + 1}</span>
                    )}
                  </div>
                  <div className={`col-span-5 text-left font-mono text-lg ${index === 0 ? 'text-yellow-400 font-bold' : 'text-white'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {score.score.toLocaleString()}
                  </div>
                  <div className="col-span-5 text-right text-gray-400 text-sm">
                    {formatDate(score.date)}
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-gray-400 text-lg mb-2">No scores yet!</p>
                <p className="text-gray-500 text-sm">
                  Play the game and your high scores will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Back to Main Menu"
          >
            Back to Menu
          </button>

          {hasScores && (
            <button
              onClick={onClearScores}
              className="flex-1 px-6 py-3 bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              aria-label="Clear All Scores"
            >
              Clear Scores
            </button>
          )}
        </div>

        {/* Legend */}
        {hasScores && (
          <p className="text-center text-gray-500 text-xs mt-4">
            Top 10 scores are saved automatically
          </p>
        )}
      </div>
    </div>
  );
}
