'use client';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseOverlay = ({ onResume, onRestart, onMenu }: PauseOverlayProps) => {
  return (
    <div 
      className="screen-overlay animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Game Paused"
    >
      <h2 className="screen-title">Paused</h2>
      
      <div className="menu-buttons">
        <button 
          className="menu-button menu-button-primary"
          onClick={onResume}
          aria-label="Resume game"
        >
          Resume
        </button>
        <button 
          className="menu-button menu-button-secondary"
          onClick={onRestart}
          aria-label="Restart current level"
        >
          Restart
        </button>
        <button 
          className="menu-button menu-button-secondary"
          onClick={onMenu}
          aria-label="Return to main menu"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
