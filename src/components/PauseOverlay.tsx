'use client';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseOverlay = ({ onResume, onRestart, onMenu }: PauseOverlayProps) => {
  return (
    <div className="screen-overlay animate-fade-in">
      <h2 className="screen-title">Paused</h2>
      
      <div className="menu-buttons">
        <button 
          className="menu-button menu-button-primary"
          onClick={onResume}
        >
          Resume
        </button>
        <button 
          className="menu-button menu-button-secondary"
          onClick={onRestart}
        >
          Restart
        </button>
        <button 
          className="menu-button menu-button-secondary"
          onClick={onMenu}
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
