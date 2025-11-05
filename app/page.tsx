"use client"

import Hero from '@/components/Hero';
import Features from '@/components/Features';
import NavBar from '@/components/NavBar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  // only pull the session data we use (status was unused and caused a lint warning)
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <Hero />

      {/* Go to Dashboard Button (only show if logged in) */}
      {session?.user?.email && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl shadow-2xl text-xl font-bold transition-all transform hover:scale-105"
          >
            Go to My Dashboard
          </button>
        </div>
      )}

      {/* Features Section */}
      <Features />
    </div>
  );
}