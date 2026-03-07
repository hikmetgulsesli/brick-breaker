import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameOverOverlay } from '@/components/GameOverOverlay';

describe('GameOverOverlay', () => {
  const defaultProps = {
    score: 1000,
    level: 1,
    onRestart: vi.fn(),
    onMenu: vi.fn(),
  };

  it('renders GAME OVER title', () => {
    render(<GameOverOverlay {...defaultProps} />);
    expect(screen.getByTestId('game-over-title')).toHaveTextContent('GAME OVER');
  });

  it('displays final score in large digits', () => {
    render(<GameOverOverlay {...defaultProps} score={5000} />);
    expect(screen.getByTestId('final-score')).toHaveTextContent('5,000');
  });

  describe('star rating', () => {
    it('shows 0 stars for score ≤30% of max', () => {
      // Level 1 max score is 300 (30 bricks × 10 points)
      // 30% of 300 = 90, so 80 points should give 0 stars
      render(<GameOverOverlay {...defaultProps} score={80} level={1} />);
      const stars = screen.getAllByTestId(/star-\d/);
      expect(stars[0]).not.toHaveClass('filled');
      expect(stars[1]).not.toHaveClass('filled');
      expect(stars[2]).not.toHaveClass('filled');
    });

    it('shows 1 star for score >30% of max', () => {
      // Level 1 max score is 300
      // >30% means >90 points
      render(<GameOverOverlay {...defaultProps} score={100} level={1} />);
      expect(screen.getByTestId('star-1')).toHaveClass('filled');
      expect(screen.getByTestId('star-2')).not.toHaveClass('filled');
      expect(screen.getByTestId('star-3')).not.toHaveClass('filled');
    });

    it('shows 2 stars for score >60% of max', () => {
      // Level 1 max score is 300
      // >60% means >180 points
      render(<GameOverOverlay {...defaultProps} score={200} level={1} />);
      expect(screen.getByTestId('star-1')).toHaveClass('filled');
      expect(screen.getByTestId('star-2')).toHaveClass('filled');
      expect(screen.getByTestId('star-3')).not.toHaveClass('filled');
    });

    it('shows 3 stars for score >90% of max', () => {
      // Level 1 max score is 300
      // >90% means >270 points
      render(<GameOverOverlay {...defaultProps} score={280} level={1} />);
      expect(screen.getByTestId('star-1')).toHaveClass('filled');
      expect(screen.getByTestId('star-2')).toHaveClass('filled');
      expect(screen.getByTestId('star-3')).toHaveClass('filled');
    });
  });

  it('displays level information', () => {
    render(<GameOverOverlay {...defaultProps} level={2} />);
    expect(screen.getByTestId('level-info')).toHaveTextContent('Level 2');
  });

  describe('PLAY AGAIN button', () => {
    it('renders with correct text', () => {
      render(<GameOverOverlay {...defaultProps} />);
      expect(screen.getByTestId('play-again-button')).toHaveTextContent('PLAY AGAIN');
    });

    it('calls onRestart when clicked', () => {
      const onRestart = vi.fn();
      render(<GameOverOverlay {...defaultProps} onRestart={onRestart} />);
      fireEvent.click(screen.getByTestId('play-again-button'));
      expect(onRestart).toHaveBeenCalledTimes(1);
    });
  });

  describe('MAIN MENU button', () => {
    it('renders with correct text', () => {
      render(<GameOverOverlay {...defaultProps} />);
      expect(screen.getByTestId('main-menu-button')).toHaveTextContent('MAIN MENU');
    });

    it('calls onMenu when clicked', () => {
      const onMenu = vi.fn();
      render(<GameOverOverlay {...defaultProps} onMenu={onMenu} />);
      fireEvent.click(screen.getByTestId('main-menu-button'));
      expect(onMenu).toHaveBeenCalledTimes(1);
    });
  });

  it('has fade-in animation class', () => {
    render(<GameOverOverlay {...defaultProps} />);
    expect(screen.getByTestId('game-over-overlay')).toHaveClass('animate-fade-in');
  });
});
