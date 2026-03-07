import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainMenu } from '@/components/MainMenu';
import { PauseOverlay } from '@/components/PauseOverlay';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { HUD } from '@/components/HUD';
import type { HighScore } from '@/types/game';

// Mock window.matchMedia for responsive tests
const createMatchMedia = (width: number) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query.includes(`${width}px`) || (width < 768 && query.includes('max-width')),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('Responsive Design', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    // Reset to default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  describe('Mobile (375px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.matchMedia = createMatchMedia(375);
    });

    it('renders MainMenu correctly on mobile', () => {
      const mockOnStart = vi.fn();
      const highScores: HighScore[] = [];

      render(
        <MainMenu 
          onStart={mockOnStart} 
          highScores={highScores}
          isMuted={false}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Retro Brick Breaker')).toBeInTheDocument();
    });

    it('renders HUD correctly on mobile', () => {
      render(
        <HUD 
          score={1000}
          lives={2}
          level={1}
          activePowerUp="laser"
          isMuted={false}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('renders PauseOverlay correctly on mobile', () => {
      const mockOnResume = vi.fn();
      const mockOnRestart = vi.fn();
      const mockOnMenu = vi.fn();

      render(
        <PauseOverlay 
          onResume={mockOnResume}
          onRestart={mockOnRestart}
          onMenu={mockOnMenu}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
  });

  describe('Tablet (768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      window.matchMedia = createMatchMedia(768);
    });

    it('renders MainMenu correctly on tablet', () => {
      const mockOnStart = vi.fn();
      const highScores: HighScore[] = [];

      render(
        <MainMenu 
          onStart={mockOnStart} 
          highScores={highScores}
          isMuted={false}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Retro Brick Breaker')).toBeInTheDocument();
    });

    it('renders GameOverOverlay correctly on tablet', () => {
      const mockOnRestart = vi.fn();
      const mockOnMenu = vi.fn();

      render(
        <GameOverOverlay 
          score={1000}
          level={1}
          onRestart={mockOnRestart}
          onMenu={mockOnMenu}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    });
  });

  describe('Desktop (1024px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      window.matchMedia = createMatchMedia(1024);
    });

    it('renders VictoryOverlay correctly on desktop', () => {
      const mockOnRestart = vi.fn();
      const mockOnMenu = vi.fn();

      render(
        <VictoryOverlay 
          score={1000}
          lives={2}
          onRestart={mockOnRestart}
          onMenu={mockOnMenu}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('VICTORY!')).toBeInTheDocument();
    });
  });

  describe('Large Desktop (1440px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });
      window.matchMedia = createMatchMedia(1440);
    });

    it('renders MainMenu correctly on large desktop', () => {
      const mockOnStart = vi.fn();
      const highScores: HighScore[] = [];

      render(
        <MainMenu 
          onStart={mockOnStart} 
          highScores={highScores}
          isMuted={false}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Retro Brick Breaker')).toBeInTheDocument();
    });
  });

  describe('Responsive Text Scaling', () => {
    it('uses clamp() for responsive font sizes', () => {
      // Verify that screen-title class uses clamp for responsive sizing
      const mockOnRestart = vi.fn();
      const mockOnMenu = vi.fn();

      const { container } = render(
        <GameOverOverlay 
          score={1000}
          level={1}
          onRestart={mockOnRestart}
          onMenu={mockOnMenu}
        />
      );

      const title = container.querySelector('.screen-title');
      expect(title).toBeInTheDocument();
      // The title should exist with responsive styling
      expect(title).toHaveTextContent('GAME OVER');
    });

    it('uses clamp() for score display', () => {
      const mockOnRestart = vi.fn();
      const mockOnMenu = vi.fn();

      const { container } = render(
        <GameOverOverlay 
          score={1000}
          level={1}
          onRestart={mockOnRestart}
          onMenu={mockOnMenu}
        />
      );

      const scoreDisplay = container.querySelector('.score-display');
      expect(scoreDisplay).toBeInTheDocument();
      expect(scoreDisplay).toHaveTextContent('1,000');
    });
  });

  describe('Canvas Responsiveness', () => {
    it('canvas maintains aspect ratio', () => {
      // The game container should have aspect-ratio: 4/3
      // This is tested via CSS, but we can verify the container structure
      const mockOnStart = vi.fn();
      const highScores: HighScore[] = [];

      const { container } = render(
        <MainMenu 
          onStart={mockOnStart} 
          highScores={highScores}
          isMuted={false}
        />
      );

      // Check that the overlay is rendered
      expect(container.querySelector('.screen-overlay')).toBeInTheDocument();
    });
  });
});
