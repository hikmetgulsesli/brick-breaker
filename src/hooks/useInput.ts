'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface InputState {
  /** Current paddle X position (0 to 1, where 0 is left edge and 1 is right edge) */
  paddleX: number;
  /** Whether the input is currently active (mouse down or touch active) */
  isActive: boolean;
  /** Keyboard state for left arrow key */
  isLeftPressed: boolean;
  /** Keyboard state for right arrow key */
  isRightPressed: boolean;
}

export interface UseInputOptions {
  /** Canvas or container element reference for coordinate calculation */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Smoothing factor for interpolation (0-1, higher = more responsive) */
  smoothing?: number;
  /** Keyboard movement speed (percentage per second) */
  keyboardSpeed?: number;
  /** Enable mouse controls */
  enableMouse?: boolean;
  /** Enable touch controls */
  enableTouch?: boolean;
  /** Enable keyboard controls */
  enableKeyboard?: boolean;
}

export interface UseInputReturn {
  /** Current input state */
  state: InputState;
  /** Reset input state to center */
  reset: () => void;
  /** Set paddle position directly (0-1) */
  setPaddleX: (x: number) => void;
}

const DEFAULT_SMOOTHING = 0.3;
const DEFAULT_KEYBOARD_SPEED = 0.8; // 80% per second

export function useInput(options: UseInputOptions): UseInputReturn {
  const {
    containerRef,
    smoothing = DEFAULT_SMOOTHING,
    keyboardSpeed = DEFAULT_KEYBOARD_SPEED,
    enableMouse = true,
    enableTouch = true,
    enableKeyboard = true,
  } = options;

  // Target position (where we want to go)
  const targetXRef = useRef<number>(0.5);
  // Current position (interpolated)
  const currentXRef = useRef<number>(0.5);
  
  const [state, setState] = useState<InputState>({
    paddleX: 0.5,
    isActive: false,
    isLeftPressed: false,
    isRightPressed: false,
  });

  // Keyboard state refs for smooth continuous movement
  const leftPressedRef = useRef<boolean>(false);
  const rightPressedRef = useRef<boolean>(false);
  const isActiveRef = useRef<boolean>(false);

  // Clamp value between 0 and 1
  const clamp = useCallback((value: number): number => {
    return Math.max(0, Math.min(1, value));
  }, []);

  // Update target position from mouse/touch event
  const updateTargetFromEvent = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const normalizedX = relativeX / rect.width;
    
    targetXRef.current = clamp(normalizedX);
  }, [containerRef, clamp]);

  // Interpolate current position toward target
  const interpolate = useCallback((deltaTime: number) => {
    const diff = targetXRef.current - currentXRef.current;
    
    // Apply smoothing with time-based interpolation
    // smoothing * 60 * deltaTime makes it frame-rate independent
    const step = diff * smoothing * 60 * deltaTime;
    
    if (Math.abs(diff) < 0.001) {
      currentXRef.current = targetXRef.current;
    } else {
      currentXRef.current += step;
    }
    
    currentXRef.current = clamp(currentXRef.current);
  }, [smoothing, clamp]);

  // Handle keyboard input with continuous movement
  const handleKeyboard = useCallback((deltaTime: number) => {
    if (!leftPressedRef.current && !rightPressedRef.current) return;
    
    const moveAmount = keyboardSpeed * deltaTime;
    
    if (leftPressedRef.current) {
      targetXRef.current = clamp(targetXRef.current - moveAmount);
    }
    if (rightPressedRef.current) {
      targetXRef.current = clamp(targetXRef.current + moveAmount);
    }
  }, [keyboardSpeed, clamp]);

  // Mouse event handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enableMouse) return;
    updateTargetFromEvent(e.clientX);
  }, [enableMouse, updateTargetFromEvent]);

  const handleMouseDown = useCallback(() => {
    if (!enableMouse) return;
    isActiveRef.current = true;
    setState(prev => ({ ...prev, isActive: true }));
  }, [enableMouse]);

  const handleMouseUp = useCallback(() => {
    if (!enableMouse) return;
    isActiveRef.current = false;
    setState(prev => ({ ...prev, isActive: false }));
  }, [enableMouse]);

  const handleMouseLeave = useCallback(() => {
    if (!enableMouse) return;
    isActiveRef.current = false;
    setState(prev => ({ ...prev, isActive: false }));
  }, [enableMouse]);

  // Touch event handlers
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enableTouch) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      updateTargetFromEvent(touch.clientX);
    }
  }, [enableTouch, updateTargetFromEvent]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableTouch) return;
    e.preventDefault();
    isActiveRef.current = true;
    const touch = e.touches[0];
    if (touch) {
      updateTargetFromEvent(touch.clientX);
    }
    setState(prev => ({ ...prev, isActive: true }));
  }, [enableTouch, updateTargetFromEvent]);

  const handleTouchEnd = useCallback(() => {
    if (!enableTouch) return;
    isActiveRef.current = false;
    setState(prev => ({ ...prev, isActive: false }));
  }, [enableTouch]);

  // Keyboard event handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enableKeyboard) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      leftPressedRef.current = true;
      setState(prev => ({ ...prev, isLeftPressed: true }));
    } else if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      rightPressedRef.current = true;
      setState(prev => ({ ...prev, isRightPressed: true }));
    }
  }, [enableKeyboard]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!enableKeyboard) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      leftPressedRef.current = false;
      setState(prev => ({ ...prev, isLeftPressed: false }));
    } else if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      rightPressedRef.current = false;
      setState(prev => ({ ...prev, isRightPressed: false }));
    }
  }, [enableKeyboard]);

  // Setup and cleanup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse events
    if (enableMouse) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mousedown', handleMouseDown, { passive: true });
      container.addEventListener('mouseup', handleMouseUp, { passive: true });
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    // Touch events - need to be non-passive for preventDefault
    if (enableTouch) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Keyboard events - attach to window for global capture
    if (enableKeyboard) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      // Cleanup mouse events
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);

      // Cleanup touch events
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);

      // Cleanup keyboard events
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    containerRef,
    enableMouse,
    enableTouch,
    enableKeyboard,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleTouchMove,
    handleTouchStart,
    handleTouchEnd,
    handleKeyDown,
    handleKeyUp,
  ]);

  // Animation loop for smooth interpolation and keyboard movement
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const tick = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Handle keyboard input
      handleKeyboard(deltaTime);

      // Interpolate toward target
      interpolate(deltaTime);

      // Update state if position changed significantly
      if (Math.abs(state.paddleX - currentXRef.current) > 0.0001) {
        setState(prev => ({
          ...prev,
          paddleX: currentXRef.current,
        }));
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [handleKeyboard, interpolate, state.paddleX]);

  const reset = useCallback(() => {
    targetXRef.current = 0.5;
    currentXRef.current = 0.5;
    leftPressedRef.current = false;
    rightPressedRef.current = false;
    setState({
      paddleX: 0.5,
      isActive: false,
      isLeftPressed: false,
      isRightPressed: false,
    });
  }, []);

  const setPaddleX = useCallback((x: number) => {
    const clampedX = clamp(x);
    targetXRef.current = clampedX;
    currentXRef.current = clampedX;
    setState(prev => ({ ...prev, paddleX: clampedX }));
  }, [clamp]);

  return {
    state,
    reset,
    setPaddleX,
  };
}
