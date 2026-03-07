'use client';

import { useEffect, useRef } from 'react';
import type { Particle } from '@/types/game';

interface ParticleRendererProps {
  particles: Particle[];
  width: number;
  height: number;
}

export const ParticleRenderer = ({ particles, width, height }: ParticleRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(particle => {
        if (!particle.active || particle.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = particle.alpha;

        // Draw particle with glow
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = particle.color;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="particle-renderer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
      aria-hidden="true"
    />
  );
};

export default ParticleRenderer;
