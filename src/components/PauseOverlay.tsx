'use client';

import { useState } from 'react';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseOverlay = ({ onResume, onRestart, onMenu }: PauseOverlayProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleMenuClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    onMenu();
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div 
        className="screen-overlay"
        style={{ 
          background: 'rgba(0, 0, 0, 0.9)',
          animation: 'fade-in 300ms ease-out'
        }}
      >
        <h2 className="screen-title">Quit Game?</h2>
        <p className="screen-subtitle">Your progress will be lost.</p>
        
        <div className="menu-buttons">
          <button 
            className="menu-button menu-button-primary"
            onClick={handleConfirmYes}
          >
            Yes, Quit
          </button>
          <button 
            className="menu-button menu-button-secondary"
            onClick={handleConfirmNo}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="screen-overlay"
      style={{ 
        background: 'rgba(0, 0, 0, 0.8)',
        animation: 'fade-in 300ms ease-out'
      }}
    >
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
          Restart Level
        </button>
        <button 
          className="menu-button menu-button-secondary"
          onClick={handleMenuClick}
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
