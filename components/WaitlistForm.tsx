'use client';

import { useState, FormEvent, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import type { ApiResponse } from '@/types';

export default function WaitlistForm() {
  const { data: session } = useSession();
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill email if user is signed in
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to join waitlist');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mb-16 p-6 bg-teal-500/20 backdrop-blur-md rounded-xl border border-teal-400/30">
        <div className="flex items-center justify-center gap-3 text-teal-200">
          <div className="bg-teal-400 rounded-full p-1">
            <Check className="w-5 h-5 text-teal-900" />
          </div>
          <p className="text-lg font-medium">You&apos;re on the list! Check your email.</p>
        </div>
      </div>
    );
  }

  // If user is signed in, show a one-click join button
  if (session?.user?.email) {
    return (
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-16">
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-2xl"
          >
            {loading ? 'Joining...' : (
              <>
                Join Waitlist
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-sm text-blue-200/70 text-center">
            You&apos;ll join with: {session.user.email}
          </p>
        </div>
        {error && (
          <p className="text-red-300 text-sm mt-2 text-center">{error}</p>
        )}
      </form>
    );
  }

  // If not signed in, show sign in prompt
  return (
    <div className="max-w-md mx-auto mb-16">
      <button
        onClick={() => signIn('google')}
        className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl"
      >
        Sign In with Google to Join
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="text-sm text-blue-200/70 text-center mt-3">
        Get instant access when we launch
      </p>
    </div>
  );
}