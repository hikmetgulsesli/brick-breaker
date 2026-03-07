'use client';

import { useState, useCallback, useRef } from 'react';
import type { Particle } from '@/types/game';
import { GAME_CONFIG } from '@/types/game';

export interface ParticleSystemState {
  particles: Particle[];
  spawnParticles: (x: number, y: number, color: string, count?: number) => void;
  updateParticles: (deltaTime: number) => void;
}

export const useParticleSystem = (): ParticleSystemState => {
  const particlesRef = useRef<Particle[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnParticles = useCallback((
    x: number,
    y: number,
    color: string,
    count: number = 10
  ) => {
    // Ensure we don't exceed max particles
    const currentCount = particlesRef.current.filter(p => p.active).length;
    const availableSlots = GAME_CONFIG.MAX_PARTICLES - currentCount;
    const spawnCount = Math.min(count, availableSlots);

    if (spawnCount <= 0) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < spawnCount; i++) {
      // Random velocity in a downward arc (brick shatter effect)
      const angle = Math.random() * Math.PI + Math.PI; // 180-360 degrees (downward)
      const speed = Math.random() * 3 + 2; // 2-5 pixels per frame
      
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20, // Random offset from center
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2 + 1, // 1-3px radius
        color,
        alpha: 1,
        lifetime: GAME_CONFIG.PARTICLE_LIFETIME,
        maxLifetime: GAME_CONFIG.PARTICLE_LIFETIME,
        active: true,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
    setParticles(particlesRef.current);
  }, []);

  const updateParticles = useCallback((deltaTime: number) => {
    particlesRef.current = particlesRef.current
      .map(particle => {
        if (!particle.active) return particle;

        // Update position
        const newX = particle.x + particle.vx;
        const newY = particle.y + particle.vy;

        // Apply gravity
        const newVy = particle.vy + 0.1;

        // Update lifetime
        const newLifetime = particle.lifetime - deltaTime;
        const newAlpha = Math.max(0, newLifetime / particle.maxLifetime);

        // Check if particle should be deactivated
        if (newLifetime <= 0) {
          return { ...particle, active: false };
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          vy: newVy,
          lifetime: newLifetime,
          alpha: newAlpha,
        };
      })
      .filter(particle => particle.active); // Remove inactive particles

    setParticles(particlesRef.current);
  }, []);

  return {
    particles,
    spawnParticles,
    updateParticles,
  };
};

export default useParticleSystem;
