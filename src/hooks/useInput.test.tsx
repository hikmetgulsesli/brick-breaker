'use client';

import { useRef, useCallback, useState } from 'react';
import { useInput } from './useInput';

/**
 * Test component to verify useInput hook functionality
 * This component visualizes paddle position and input state
 */
export function UseInputTest(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const { state, reset, setPaddleX } = useInput({
    containerRef,
    smoothing: 0.2,
    keyboardSpeed: 0.5,
    enableMouse: true,
    enableTouch: true,
    enableKeyboard: true,
  });

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const handleReset = useCallback(() => {
    reset();
    addLog('Paddle reset to center');
  }, [reset, addLog]);

  const handleSetLeft = useCallback(() => {
    setPaddleX(0.1);
    addLog('Paddle set to 0.1 (10%)');
  }, [setPaddleX, addLog]);

  const handleSetRight = useCallback(() => {
    setPaddleX(0.9);
    addLog('Paddle set to 0.9 (90%)');
  }, [setPaddleX, addLog]);

  // Calculate paddle pixel position for visual feedback
  const paddlePosition = `${state.paddleX * 100}%`;
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">useInput Hook Test</h2>
      
      {/* Game Area */}
      <div
        ref={containerRef}
        className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden mb-4 cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
      >
        {/* Grid lines for visual reference */}
        <div className="absolute inset-0 opacity-20">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(pct => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 w-px bg-gray-400"
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>
        
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-600" />
        
        {/* Paddle */}
        <div
          className="absolute bottom-4 w-20 h-3 bg-cyan-400 rounded shadow-lg transition-transform"
          style={{
            left: paddlePosition,
            transform: 'translateX(-50%)',
            boxShadow: state.isActive ? '0 0 10px 2px rgba(34, 211, 238, 0.8)' : '0 0 5px 1px rgba(34, 211, 238, 0.5)',
          }}
        />
        
        {/* Position indicator */}
        <div className="absolute top-2 left-2 text-xs text-gray-400 font-mono">
          X: {state.paddleX.toFixed(3)}
        </div>
        
        {/* Active indicator */}
        {state.isActive && (
          <div className="absolute top-2 right-2 text-xs text-cyan-400 font-bold">
            ACTIVE
          </div>
        )}
        
        {/* Keyboard indicators */}
        <div className="absolute bottom-2 left-2 flex gap-2">
          <div
            className={`px-2 py-1 rounded text-xs font-bold ${
              state.isLeftPressed ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            ← LEFT
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-bold ${
              state.isRightPressed ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            RIGHT →
          </div>
        </div>
      </div>
      
      {/* State Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded">
          <h3 className="text-sm font-bold text-gray-400 mb-2">State</h3>
          <pre className="text-xs text-gray-300 overflow-x-auto">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-800 p-3 rounded">
          <h3 className="text-sm font-bold text-gray-400 mb-2">Logs</h3>
          <div className="text-xs text-gray-300 space-y-1">
            {logs.length === 0 ? (
              <span className="text-gray-500 italic">No events yet...</span>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
        >
          Reset to Center
        </button>
        <button
          onClick={handleSetLeft}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
        >
          Set Left (10%)
        </button>
        <button
          onClick={handleSetRight}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
        >
          Set Right (90%)
        </button>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
        <h3 className="font-bold mb-2">How to test:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Mouse:</strong> Move cursor over the game area, click and drag</li>
          <li><strong>Touch:</strong> Touch and drag on the game area (mobile)</li>
          <li><strong>Keyboard:</strong> Hold ←/→ arrow keys or A/D keys</li>
          <li>Paddle should smoothly interpolate to target position</li>
          <li>Paddle stays within bounds (0-100%)</li>
        </ul>
      </div>
    </div>
  );
}

export default UseInputTest;
