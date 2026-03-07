'use client';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export function PauseOverlay({ onResume, onRestart, onMenu }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-cyan-400 rounded-lg p-8 max-w-sm w-full mx-4 shadow-[0_0_50px_rgba(34,211,238,0.4)]">
        <h2 className="text-4xl font-bold text-center text-white mb-8 tracking-wider">
          PAUSED
        </h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={onResume}
            className="w-full px-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Resume Game"
          >
            Resume
          </button>

          <button
            onClick={onRestart}
            className="w-full px-6 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Restart Game"
          >
            Restart
          </button>

          <button
            onClick={onMenu}
            className="w-full px-6 py-4 bg-transparent border-2 border-fuchsia-400 text-fuchsia-400 hover:bg-fuchsia-400 hover:text-gray-900 font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Return to Main Menu"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
