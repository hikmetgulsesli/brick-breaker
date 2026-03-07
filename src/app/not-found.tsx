import Link from 'next/link';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NeonButton } from '@/components/NeonButton';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="screen-title mb-4" style={{ 
          background: 'linear-gradient(90deg, var(--neon-red), var(--neon-orange))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          404
        </h1>
        <p className="screen-subtitle mb-12">Page not found in this galaxy</p>
        
        <nav className="menu-buttons">
          <Link href="/" className="w-full">
            <NeonButton variant="primary" className="w-full">
              Return to Base
            </NeonButton>
          </Link>
        </nav>
      </div>
    </main>
  );
}
