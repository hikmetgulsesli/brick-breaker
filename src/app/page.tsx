'use client';

import Link from 'next/link';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NeonButton } from '@/components/NeonButton';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="screen-title mb-4">Retro Brick Breaker</h1>
        <p className="screen-subtitle mb-12">Break all bricks. Save the galaxy.</p>
        
        <nav className="menu-buttons">
          <Link href="/levels" className="w-full">
            <NeonButton variant="primary" className="w-full">
              Start Game
            </NeonButton>
          </Link>
          
          <Link href="/scores" className="w-full">
            <NeonButton variant="secondary" className="w-full">
              High Scores
            </NeonButton>
          </Link>
        </nav>
        
        <div className="mt-12 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          <p>Mouse/Touch to move paddle</p>
          <p className="mt-1">Click to shoot lasers (when active)</p>
        </div>
      </div>
    </main>
  );
}
