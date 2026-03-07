'use client';

interface MainMenuProps {
  onStartGame: () => void;
  onShowHighScores: () => void;
}

export function MainMenu({ onStartGame, onShowHighScores }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Title with neon glow effect */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-wider text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse">
          BRICK
          <span className="block text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]">
            BREAKER
          </span>
        </h1>

        {/* Retro subtitle */}
        <p className="text-gray-400 text-sm tracking-[0.3em] uppercase">
          Classic Arcade Action
        </p>

        {/* Menu buttons */}
        <div className="flex flex-col gap-4 mt-12">
          <button
            onClick={onStartGame}
            className="group relative px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold text-lg tracking-wider uppercase transition-all duration-200 hover:bg-cyan-400 hover:text-gray-900 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Start Game"
          >
            Start Game
          </button>

          <button
            onClick={onShowHighScores}
            className="group relative px-8 py-4 bg-transparent border-2 border-fuchsia-400 text-fuchsia-400 font-bold text-lg tracking-wider uppercase transition-all duration-200 hover:bg-fuchsia-400 hover:text-gray-900 hover:shadow-[0_0_20px_rgba(232,121,249,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="View High Scores"
          >
            High Scores
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-4 border border-gray-700 rounded bg-gray-800/50">
          <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2">
            How to Play
          </h3>
          <ul className="text-gray-400 text-xs space-y-1 text-left">
            <li>• Move mouse or touch to control paddle</li>
            <li>• Break all bricks to advance</li>
            <li>• Collect power-ups for advantages</li>
            <li>• 3 lives - make them count!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
