import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VictoryOverlay } from '@/components/VictoryOverlay';

describe('VictoryOverlay', () => {
  const defaultProps = {
    score: 1000,
    lives: 2,
    onRestart: vi.fn(),
    onMenu: vi.fn(),
  };

  it('renders VICTORY title', () => {
    render(<VictoryOverlay {...defaultProps} />);
    expect(screen.getByTestId('victory-title')).toHaveTextContent('VICTORY!');
  });

  it('displays base score', () => {
    render(<VictoryOverlay {...defaultProps} score={5000} />);
    expect(screen.getByTestId('base-score')).toHaveTextContent('Base Score: 5,000');
  });

  it('calculates and displays lives bonus correctly', () => {
    render(<VictoryOverlay {...defaultProps} lives={3} />);
    // 3 lives × 500 = 1500 bonus
    expect(screen.getByTestId('lives-bonus')).toHaveTextContent('Lives Bonus: +1,500 (3 × 500)');
  });

  it('displays final score with lives bonus added', () => {
    render(<VictoryOverlay {...defaultProps} score={2000} lives={2} />);
    // 2000 + (2 × 500) = 3000
    expect(screen.getByTestId('final-score')).toHaveTextContent('3,000');
  });

  describe('star rating based on final score', () => {
    it('shows 0 stars for low final score', () => {
      render(<VictoryOverlay {...defaultProps} score={100} lives={0} />);
      const stars = screen.getAllByTestId(/star-\d/);
      expect(stars[0]).not.toHaveClass('filled');
    });

    it('shows 3 stars for high final score (>90% of max)', () => {
      // Max score across all levels is approximately 2460
      // >90% means >2214 final score
      render(<VictoryOverlay {...defaultProps} score={2000} lives={1} />);
      expect(screen.getByTestId('star-1')).toHaveClass('filled');
      expect(screen.getByTestId('star-2')).toHaveClass('filled');
      expect(screen.getByTestId('star-3')).toHaveClass('filled');
    });
  });

  it('displays completion message', () => {
    render(<VictoryOverlay {...defaultProps} />);
    expect(screen.getByTestId('completion-text')).toHaveTextContent('All levels completed!');
  });

  describe('PLAY AGAIN button', () => {
    it('renders with correct text', () => {
      render(<VictoryOverlay {...defaultProps} />);
      expect(screen.getByTestId('play-again-button')).toHaveTextContent('PLAY AGAIN');
    });

    it('calls onRestart when clicked', () => {
      const onRestart = vi.fn();
      render(<VictoryOverlay {...defaultProps} onRestart={onRestart} />);
      fireEvent.click(screen.getByTestId('play-again-button'));
      expect(onRestart).toHaveBeenCalledTimes(1);
    });
  });

  describe('MAIN MENU button', () => {
    it('renders with correct text', () => {
      render(<VictoryOverlay {...defaultProps} />);
      expect(screen.getByTestId('main-menu-button')).toHaveTextContent('MAIN MENU');
    });

    it('calls onMenu when clicked', () => {
      const onMenu = vi.fn();
      render(<VictoryOverlay {...defaultProps} onMenu={onMenu} />);
      fireEvent.click(screen.getByTestId('main-menu-button'));
      expect(onMenu).toHaveBeenCalledTimes(1);
    });
  });

  it('has fade-in animation class', () => {
    render(<VictoryOverlay {...defaultProps} />);
    expect(screen.getByTestId('victory-overlay')).toHaveClass('animate-fade-in');
  });
});
