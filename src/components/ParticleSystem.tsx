'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Particle } from '@/types/game';
import { GAME_CONFIG } from '@/types/game';

export interface ParticleSystemAPI {
  particles: Particle[];
  spawnParticles: (x: number, y: number, color: string, count?: number, type?: 'shatter' | 'sparkle' | 'trail') => void;
  spawnPowerUpSparkles: (x: number, y: number, color: string) => void;
  spawnBallTrail: (x: number, y: number, color: string) => void;
  updateParticles: (deltaTime: number) => void;
  clearParticles: () => void;
  getActiveParticleCount: () => number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number;

  constructor(maxParticles: number = GAME_CONFIG.MAX_PARTICLES) {
    this.maxParticles = maxParticles;
  }

  /**
   * Spawn particles at a position with specified color and count
   * @param x - X position
   * @param y - Y position  
   * @param color - Particle color (hex string)
   * @param count - Number of particles to spawn (default 10)
   * @param type - Type of particle effect ('shatter', 'sparkle', 'trail')
   */
  spawnParticles(
    x: number,
    y: number,
    color: string,
    count: number = 10,
    type: 'shatter' | 'sparkle' | 'trail' = 'shatter'
  ): void {
    const currentCount = this.particles.filter(p => p.active).length;
    const availableSlots = this.maxParticles - currentCount;
    const spawnCount = Math.min(count, availableSlots);

    if (spawnCount <= 0) return;

    for (let i = 0; i < spawnCount; i++) {
      let vx: number;
      let vy: number;
      let radius: number;
      let lifetime: number;
      let alpha: number;

      switch (type) {
        case 'shatter':
          // Brick destruction: particles explode downward in an arc
          const angle = Math.random() * Math.PI + Math.PI; // 180-360 degrees (downward)
          const speed = Math.random() * 3 + 2; // 2-5 pixels per frame
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          radius = Math.random() * 2 + 1; // 1-3px radius
          lifetime = GAME_CONFIG.PARTICLE_LIFETIME;
          alpha = 1;
          break;

        case 'sparkle':
          // Power-up collection: particles burst outward in all directions
          const sparkleAngle = Math.random() * Math.PI * 2; // All directions
          const sparkleSpeed = Math.random() * 4 + 1;
          vx = Math.cos(sparkleAngle) * sparkleSpeed;
          vy = Math.sin(sparkleAngle) * sparkleSpeed;
          radius = Math.random() * 1.5 + 0.5; // Smaller particles
          lifetime = GAME_CONFIG.PARTICLE_LIFETIME * 0.6; // Shorter lifetime
          alpha = 1;
          break;

        case 'trail':
          // Ball trail: small particles following the ball
          vx = (Math.random() - 0.5) * 0.5;
          vy = (Math.random() - 0.5) * 0.5;
          radius = Math.random() * 1.5 + 0.5;
          lifetime = GAME_CONFIG.PARTICLE_LIFETIME * 0.3; // Very short lifetime
          alpha = 0.6;
          break;

        default:
          vx = (Math.random() - 0.5) * 2;
          vy = (Math.random() - 0.5) * 2;
          radius = Math.random() * 2 + 1;
          lifetime = GAME_CONFIG.PARTICLE_LIFETIME;
          alpha = 1;
      }

      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx,
        vy,
        radius,
        color,
        alpha,
        lifetime,
        maxLifetime: lifetime,
        active: true,
      });
    }
  }

  /**
   * Spawn sparkle particles for power-up collection
   * @param x - X position
   * @param y - Y position
   * @param color - Power-up color
   */
  spawnPowerUpSparkles(x: number, y: number, color: string): void {
    // Spawn 12-16 sparkles for power-up collection
    const count = Math.floor(Math.random() * 5) + 12;
    this.spawnParticles(x, y, color, count, 'sparkle');
  }

  /**
   * Spawn a trail particle for the ball
   * @param x - Ball X position
   * @param y - Ball Y position
   * @param color - Trail color
   */
  spawnBallTrail(x: number, y: number, color: string): void {
    // Only spawn trail occasionally to avoid too many particles
    if (Math.random() > 0.3) return;
    this.spawnParticles(x, y, color, 1, 'trail');
  }

  /**
   * Update all particles - position, velocity, lifetime, alpha
   * @param deltaTime - Time since last frame in ms
   */
  updateParticles(deltaTime: number = 16): void {
    this.particles = this.particles
      .map(particle => {
        if (!particle.active) return particle;

        // Update position
        const newX = particle.x + particle.vx;
        const newY = particle.y + particle.vy;

        // Apply gravity (stronger for shatter particles)
        const newVy = particle.vy + 0.15;

        // Update lifetime
        const newLifetime = particle.lifetime - deltaTime;

        // Calculate alpha based on remaining lifetime (fade out)
        const newAlpha = Math.max(0, newLifetime / particle.maxLifetime);

        // Check if particle should be deactivated
        if (newLifetime <= 0 || newAlpha <= 0) {
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
  }

  /**
   * Get current active particles
   */
  getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * Get count of active particles
   */
  getActiveParticleCount(): number {
    return this.particles.filter(p => p.active).length;
  }

  /**
   * Clear all particles
   */
  clearParticles(): void {
    this.particles = [];
  }

  /**
   * Set maximum particle limit
   */
  setMaxParticles(max: number): void {
    this.maxParticles = max;
    // Trim excess particles if needed
    const activeCount = this.getActiveParticleCount();
    if (activeCount > max) {
      this.particles = this.particles.filter(p => !p.active).concat(
        this.particles.filter(p => p.active).slice(0, max)
      );
    }
  }
}

/**
 * React hook to use the ParticleSystem in components
 */
export const useParticleSystemClass = (): ParticleSystemAPI => {
  // Use useMemo to create the system instance once
  const system = useMemo(() => new ParticleSystem(GAME_CONFIG.MAX_PARTICLES), []);
  
  // Local state to trigger re-renders when particles change
  const [, setTick] = useState(0);

  const spawnParticles = useCallback((
    x: number,
    y: number,
    color: string,
    count?: number,
    type?: 'shatter' | 'sparkle' | 'trail'
  ) => {
    system.spawnParticles(x, y, color, count, type);
    setTick(t => t + 1);
  }, [system]);

  const spawnPowerUpSparkles = useCallback((x: number, y: number, color: string) => {
    system.spawnPowerUpSparkles(x, y, color);
    setTick(t => t + 1);
  }, [system]);

  const spawnBallTrail = useCallback((x: number, y: number, color: string) => {
    system.spawnBallTrail(x, y, color);
  }, [system]);

  const updateParticles = useCallback((deltaTime: number) => {
    system.updateParticles(deltaTime);
    setTick(t => t + 1);
  }, [system]);

  const clearParticles = useCallback(() => {
    system.clearParticles();
    setTick(t => t + 1);
  }, [system]);

  const getActiveParticleCount = useCallback(() => {
    return system.getActiveParticleCount();
  }, [system]);

  return {
    particles: system.getParticles(),
    spawnParticles,
    spawnPowerUpSparkles,
    spawnBallTrail,
    updateParticles,
    clearParticles,
    getActiveParticleCount,
  };
};

export default ParticleSystem;
