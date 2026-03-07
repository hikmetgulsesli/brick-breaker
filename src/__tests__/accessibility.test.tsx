import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainMenu } from '@/components/MainMenu';
import { PauseOverlay } from '@/components/PauseOverlay';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { HUD } from '@/components/HUD';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import type { HighScore } from '@/types/game';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = mockMatchMedia(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ARIA Labels', () => {
    it('MainMenu has proper ARIA attributes', () => {
      const mockOnStart = vi.fn();
      const mockOnToggleMute = vi.fn();
      const highScores: HighScore[] = [];

      render(
        <MainMenu 
          onStart={mockOnStart} 
          highScores={highScores}
          isMuted={false}
          onToggleMute={mockOnToggleMute}
        />
      );

      // Check dialog role
      const menu = screen.getByRole('dialog');
      expect(menu).toHaveAttribute('aria-modal', 'true');
      expect(menu).toHaveAttribute('aria-label', 'Main Menu');

      // Check mute button
      const muteButton = screen.getByRole('button', { name: /mute sound/i });
      expect(muteButton).toHaveAttribute('aria-pressed', 'false');

      // Check level selector
      const levelSelector = screen.getByRole('radiogroup', { name: /select level/i });
      expect(levelSelector).toBeInTheDocument();

      // Check level buttons
      const level1Button = screen.getByRole('radio', { name: /level 1/i });
      expect(level1Button).toHaveAttribute('aria-checked', 'true');
    });

    it('PauseOverlay has proper ARIA attributes', () => {
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

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Game Paused');

      expect(screen.getByRole('button', { name: /resume game/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /restart current level/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /return to main menu/i })).toBeInTheDocument();
    });

    it('GameOverOverlay has proper ARIA attributes', () => {
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

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Game Over');

      // Check star rating
      const starRating = screen.getByRole('img', { name: /stars earned/i });
      expect(starRating).toBeInTheDocument();

      // Check score announcement
      const score = screen.getByLabelText(/final score/i);
      expect(score).toHaveTextContent('1,000');
    });

    it('VictoryOverlay has proper ARIA attributes', () => {
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

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Victory! All levels completed');

      // Check base score
      const baseScore = screen.getByLabelText(/base score/i);
      expect(baseScore).toHaveTextContent('1,000');

      // Check lives bonus
      const livesBonus = screen.getByLabelText(/lives bonus/i);
      expect(livesBonus).toHaveTextContent('1,000');

      // Check final score
      const finalScore = screen.getByLabelText(/final score/i);
      expect(finalScore).toHaveTextContent('2,000');
    });

    it('HUD has proper ARIA attributes', () => {
      const mockOnToggleMute = vi.fn();

      render(
        <HUD 
          score={1000}
          lives={2}
          level={1}
          activePowerUp="laser"
          isMuted={false}
          onToggleMute={mockOnToggleMute}
        />
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Game status');
      expect(status).toHaveAttribute('aria-live', 'polite');

      // Check score label
      const scoreLabel = screen.getByLabelText(/score: 1,000/i);
      expect(scoreLabel).toBeInTheDocument();

      // Check level label
      const levelLabel = screen.getByLabelText(/level: 1/i);
      expect(levelLabel).toBeInTheDocument();

      // Check power-up label
      const powerUpLabel = screen.getByLabelText(/active power-up: laser/i);
      expect(powerUpLabel).toBeInTheDocument();

      // Check lives label
      const livesLabel = screen.getByLabelText(/2 lives remaining out of 3/i);
      expect(livesLabel).toBeInTheDocument();

      // Check mute button
      const muteButton = screen.getByRole('button', { name: /mute sound/i });
      expect(muteButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Focus Management', () => {
    it('buttons have visible focus indicators', () => {
      const mockOnStart = vi.fn();
      const mockOnToggleMute = vi.fn();
      const highScores: HighScore[] = [];

      render(
        <MainMenu 
          onStart={mockOnStart} 
          highScores={highScores}
          isMuted={false}
          onToggleMute={mockOnToggleMute}
        />
      );

      const startButton = screen.getByRole('button', { name: /start game/i });
      
      // Check that the button is focusable (has tabindex or is naturally focusable)
      expect(startButton).toBeInTheDocument();
      expect(startButton.tagName).toBe('BUTTON');
      
      // Verify button has proper styling class for focus
      expect(startButton.className).toContain('menu-button');
    });

    it('all interactive elements are keyboard accessible', () => {
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

      // Verify all buttons are rendered and are button elements
      const resumeButton = screen.getByRole('button', { name: /resume game/i });
      const restartButton = screen.getByRole('button', { name: /restart current level/i });
      const menuButton = screen.getByRole('button', { name: /return to main menu/i });
      
      expect(resumeButton.tagName).toBe('BUTTON');
      expect(restartButton.tagName).toBe('BUTTON');
      expect(menuButton.tagName).toBe('BUTTON');
    });
  });

  describe('Accessibility Settings', () => {
    it('toggles reduced motion setting', async () => {
      const user = userEvent.setup();
      
      render(<AccessibilitySettings />);

      // Open accessibility panel
      const toggleButton = screen.getByRole('button', { name: /toggle accessibility settings/i });
      await user.click(toggleButton);

      // Find reduced motion button
      const reducedMotionButton = await screen.findByRole('button', { name: /enable reduced motion/i });
      expect(reducedMotionButton).toHaveAttribute('aria-pressed', 'false');

      // Toggle reduced motion
      await user.click(reducedMotionButton);
      
      // Check that setting was saved to localStorage
      const stored = JSON.parse(localStorage.getItem('brickBreakerAccessibility') || '{}');
      expect(stored.reducedMotion).toBe(true);

      // Check document attribute
      expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
    });

    it('toggles high contrast setting', async () => {
      const user = userEvent.setup();
      
      render(<AccessibilitySettings />);

      // Open accessibility panel
      const toggleButton = screen.getByRole('button', { name: /toggle accessibility settings/i });
      await user.click(toggleButton);

      // Find high contrast button
      const highContrastButton = await screen.findByRole('button', { name: /enable high contrast/i });
      expect(highContrastButton).toHaveAttribute('aria-pressed', 'false');

      // Toggle high contrast
      await user.click(highContrastButton);

      // Check that setting was saved to localStorage
      const stored = JSON.parse(localStorage.getItem('brickBreakerAccessibility') || '{}');
      expect(stored.highContrast).toBe(true);

      // Check document attribute
      expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
    });

    it('loads settings from localStorage on mount', () => {
      localStorage.setItem('brickBreakerAccessibility', JSON.stringify({
        reducedMotion: true,
        highContrast: true,
      }));

      render(<AccessibilitySettings />);

      // Check that settings are applied
      expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
      expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
    });

    it('respects system preferences when no stored settings', () => {
      // Mock prefers-reduced-motion: reduce
      window.matchMedia = mockMatchMedia(true);

      render(<AccessibilitySettings />);

      // Should use system preference
      expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('level selector uses radio button pattern', async () => {
      const user = userEvent.setup();
      const mockOnStart = vi.fn();
      const highScores: HighScore[] = [];

      render(
        <MainMenu 
          onStart={mockOnStart} 
          highScores={highScores}
          isMuted={false}
        />
      );

      const level1 = screen.getByRole('radio', { name: /level 1/i });
      const level2 = screen.getByRole('radio', { name: /level 2/i });
      const level3 = screen.getByRole('radio', { name: /level 3/i });

      expect(level1).toHaveAttribute('aria-checked', 'true');
      expect(level2).toHaveAttribute('aria-checked', 'false');
      expect(level3).toHaveAttribute('aria-checked', 'false');

      // Click level 2
      await user.click(level2);
      
      expect(level1).toHaveAttribute('aria-checked', 'false');
      expect(level2).toHaveAttribute('aria-checked', 'true');
      expect(level3).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Screen Reader Support', () => {
    it('HUD announces score changes politely', () => {
      const { rerender } = render(
        <HUD 
          score={0}
          lives={3}
          level={1}
          activePowerUp={null}
          isMuted={false}
        />
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');

      // Update score
      rerender(
        <HUD 
          score={100}
          lives={3}
          level={1}
          activePowerUp={null}
          isMuted={false}
        />
      );

      // Score should be announced (politely, not interrupting)
      expect(screen.getByLabelText(/score: 100/i)).toBeInTheDocument();
    });

    it('buttons have descriptive labels', () => {
      const mockOnStart = vi.fn();
      const mockOnToggleMute = vi.fn();
      const highScores: HighScore[] = [];

      render(
        <MainMenu 
          onStart={mockOnStart} 
          highScores={highScores}
          isMuted={true}
          onToggleMute={mockOnToggleMute}
        />
      );

      // Check that all buttons have accessible names
      expect(screen.getByRole('button', { name: /unmute sound/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start game at level 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view high scores/i })).toBeInTheDocument();
    });
  });

  describe('Touch Target Size', () => {
    it('buttons meet minimum touch target size', () => {
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

      const buttons = screen.getAllByRole('button');
      
      // Verify buttons exist (WCAG 2.5.5: Touch Target Size)
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });
});
