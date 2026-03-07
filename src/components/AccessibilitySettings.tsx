'use client';

import { useState, useEffect, useCallback, useSyncExternalStore, useRef } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
}

const STORAGE_KEY = 'brickBreakerAccessibility';

// Subscribe to localStorage changes
const subscribe = (callback: () => void) => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
};

// Get snapshot from localStorage
const getSnapshot = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
};

const getServerSnapshot = (): null => null;

// Parse settings from localStorage value
const parseSettings = (stored: string | null, fallback: AccessibilitySettings): AccessibilitySettings => {
  if (stored) {
    try {
      return JSON.parse(stored) as AccessibilitySettings;
    } catch {
      // Fall through to fallback
    }
  }
  return fallback;
};

// Get initial settings from localStorage or system preferences
const getInitialSettings = (): AccessibilitySettings => {
  if (typeof window === 'undefined') {
    return { reducedMotion: false, highContrast: false };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as AccessibilitySettings;
    } catch {
      // Fall through to defaults
    }
  }
  
  // Check for system preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
  
  return {
    reducedMotion: prefersReducedMotion,
    highContrast: prefersHighContrast,
  };
};

export const AccessibilitySettings = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(getInitialSettings);
  const [isVisible, setIsVisible] = useState(false);

  // Sync with localStorage changes from other tabs - use useSyncExternalStore result to compute settings
  const storedSettingsRaw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Use a ref to track the last synced value to avoid setState in effect cascade
  const lastSyncedRawRef = useRef<string | null>(storedSettingsRaw);
  const settingsRef = useRef(settings);

  // Keep settings ref in sync
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Handle external storage changes without calling setState directly in render
  useEffect(() => {
    if (storedSettingsRaw !== lastSyncedRawRef.current) {
      lastSyncedRawRef.current = storedSettingsRaw;
      const parsed = parseSettings(storedSettingsRaw, settingsRef.current);
      setSettings(parsed);
    }
  }, [storedSettingsRaw]);

  // Apply settings to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    document.documentElement.setAttribute(
      'data-reduced-motion',
      settings.reducedMotion ? 'true' : 'false'
    );
    document.documentElement.setAttribute(
      'data-high-contrast',
      settings.highContrast ? 'true' : 'false'
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMedia = window.matchMedia('(prefers-contrast: more)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings((prev) => ({ ...prev, reducedMotion: e.matches }));
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings((prev) => ({ ...prev, highContrast: e.matches }));
    };
    
    motionMedia.addEventListener('change', handleMotionChange);
    contrastMedia.addEventListener('change', handleContrastChange);
    
    return () => {
      motionMedia.removeEventListener('change', handleMotionChange);
      contrastMedia.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  return (
    <div className="accessibility-toggle">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="accessibility-btn"
        aria-label="Toggle accessibility settings"
        aria-expanded={isVisible}
        aria-controls="accessibility-panel"
        title="Accessibility Options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      </button>
      
      {isVisible && (
        <div
          id="accessibility-panel"
          role="group"
          aria-label="Accessibility settings"
          className="absolute bottom-full right-0 mb-2 p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-lg min-w-[180px]"
          style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '8px' }}
        >
          <div className="flex flex-col gap-2">
            <button
              onClick={toggleReducedMotion}
              className={`accessibility-btn text-left flex items-center gap-2 ${
                settings.reducedMotion ? 'active' : ''
              }`}
              aria-pressed={settings.reducedMotion}
              aria-label={settings.reducedMotion ? 'Disable reduced motion' : 'Enable reduced motion'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
                {settings.reducedMotion && <line x1="2" y1="2" x2="22" y2="22" />}
              </svg>
              Reduced Motion
            </button>
            
            <button
              onClick={toggleHighContrast}
              className={`accessibility-btn text-left flex items-center gap-2 ${
                settings.highContrast ? 'active' : ''
              }`}
              aria-pressed={settings.highContrast}
              aria-label={settings.highContrast ? 'Disable high contrast' : 'Enable high contrast'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              High Contrast
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
