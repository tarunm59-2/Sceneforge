'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const SceneViewer = dynamic(() => import('../../../components/SceneViewer'), { ssr: false });

export default function PartySessionPage() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key); // Debug log
      if (e.key === 'Escape') {
        // Use NEXT_PUBLIC_APP_URL from window.__NEXT_DATA__.env or window.env if available
        let appUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!appUrl && typeof window !== 'undefined') {
          appUrl = (window as Record<string, unknown>)?.env?.NEXT_PUBLIC_APP_URL || (window as Record<string, unknown>).__NEXT_DATA__?.env?.NEXT_PUBLIC_APP_URL;
        }
        if (!appUrl) {
          appUrl = 'http://localhost:3001';
        }
        console.log('Escape detected, redirecting to:', appUrl);
        window.location.href = appUrl;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <SceneViewer />
    </div>
  );
}
