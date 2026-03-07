'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export interface GameLoopState {
  deltaTime: number;
  fps: number;
  frameCount: number;
  isRunning: boolean;
}

export interface GameLoopCallbacks {
  onUpdate?: (deltaTime: number) => void;
  onRender?: () => void;
}

export interface UseGameLoopReturn {
  state: GameLoopState;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useGameLoop(
  callbacks: GameLoopCallbacks = {}
): UseGameLoopReturn {
  const [state, setState] = useState<GameLoopState>({
    deltaTime: 0,
    fps: 0,
    frameCount: 0,
    isRunning: false,
  });

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref up to date
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Store the loop function in a ref to avoid circular dependency
  const loopFnRef = useRef<((currentTime: number) => void) | undefined>(undefined);

  // Define the loop logic
  const createLoop = useCallback(() => {
    return (currentTime: number): void => {
      if (!isRunningRef.current) return;

      // Initialize lastTime on first frame
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        fpsTimeRef.current = currentTime;
      }

      // Calculate delta time in seconds
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Update with fixed timestep (prevent spiral of death)
      const maxDeltaTime = 0.1; // 100ms max to prevent huge jumps
      const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);

      // Call update callback from ref
      const { onUpdate } = callbacksRef.current;
      if (onUpdate) {
        onUpdate(clampedDeltaTime);
      }

      // Call render callback from ref
      const { onRender } = callbacksRef.current;
      if (onRender) {
        onRender();
      }

      // Update frame count
      frameCountRef.current++;

      // Calculate FPS every second - only update state then to avoid excessive re-renders
      if (currentTime - fpsTimeRef.current >= 1000) {
        const fps = frameCountRef.current;
        frameCountRef.current = 0;
        fpsTimeRef.current = currentTime;
        
        setState(prev => ({
          ...prev,
          fps,
          deltaTime: clampedDeltaTime,
          frameCount: prev.frameCount + fps,
        }));
      }

      // Schedule next frame
      animationRef.current = requestAnimationFrame(loopFnRef.current!);
    };
  }, []);

  // Set up the loop function ref
  useEffect(() => {
    loopFnRef.current = createLoop();
  }, [createLoop]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    
    isRunningRef.current = true;
    lastTimeRef.current = 0;
    
    setState(prev => ({ ...prev, isRunning: true }));
    
    if (loopFnRef.current) {
      animationRef.current = requestAnimationFrame(loopFnRef.current);
    }
  }, []);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    lastTimeRef.current = 0;
    frameCountRef.current = 0;
    fpsTimeRef.current = 0;
    
    setState({
      deltaTime: 0,
      fps: 0,
      frameCount: 0,
      isRunning: false,
    });
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    state,
    start,
    stop,
    reset,
  };
}
