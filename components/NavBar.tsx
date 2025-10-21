'use client';

import { Sparkles } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <div className="bg-gradient-to-r from-blue-400 to-teal-400 p-2 rounded-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="bg-gradient-to-r from-blue-200 to-teal-200 bg-clip-text text-transparent">
          SceneForge
        </span>
      </div>

      {status === 'loading' ? (
        <div className="px-6 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
          Loading...
        </div>
      ) : session ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">{session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/20"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn('google')}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/20"
        >
          Sign In with Google
        </button>
      )}
    </nav>
  );
}
