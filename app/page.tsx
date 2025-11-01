"use client"

import Hero from '@/components/Hero';
import Features from '@/components/Features';
import NavBar from '@/components/NavBar';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create party flow: call external API once before navigating to GLB viewer
  const createParty = async () => {
    if (creating) return;
    setError(null);

    // Ensure user is signed in
    if (!session?.user) {
      setError('You must be signed in to create a party');
      return;
    }

    // Prompt required
    if (!prompt || prompt.trim().length === 0) {
      setError('Please enter a prompt');
      return;
    }

    setCreating(true);

    try {
      // Call Intellectible directly from the client (user requested client-side calls).
      const endpoint = 'https://app.intellectible.com/api/publicv1/projects/-Ocwpv-hOQbSt8QI9OXI/workflows/-Ocy2s_2Ry0x76DcnSxY/runsync';
      const apiKey = process.env.NEXT_PUBLIC_INTELLECTIBLE_API_KEY || 'YOUR_API_KEY';
      const headers: Record<string,string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Use raw API key in Authorization header (no Bearer) as requested
        'Authorization': apiKey
      };

      const name = session.user.name || session.user.email || 'unknown';
      const email = session.user.email || '';
      // Generate a random 15-character userId (client-side) to avoid exposing internal ids.
      const generateRandomId = (len = 15) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        try {
          const arr = new Uint8Array(len);
          crypto.getRandomValues(arr);
          return Array.from(arr, (v) => chars[v % chars.length]).join('');
        } catch {
          // Fallback to Math.random if crypto is not available
          let s = '';
          for (let i = 0; i < len; i++) {
            s += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return s;
        }
      };

      // Generate a 15-digit numeric scene_id (client-side) and include it in initialize
      const generateRandomDigits = (len = 15) => {
        const digits = '0123456789';
        try {
          const arr = new Uint8Array(len);
          crypto.getRandomValues(arr);
          return Array.from(arr, (v) => digits[v % digits.length]).join('');
        } catch {
          // Fallback to Math.random if crypto is not available
          let s = '';
          for (let i = 0; i < len; i++) {
            s += digits.charAt(Math.floor(Math.random() * 10));
          }
          return s;
        }
      };

      const userId = generateRandomId(15);
      const generatedSceneId = generateRandomDigits(15);

      // First call: initialize with inputs (include client-generated scene_id)
      const initBody = {
        runEvent: 'initialize',
        inputs: {
          name,
          email,
          prompt,
          userId,
          scene_id: generatedSceneId
        }
      };

      console.log('Sending initialize request to Intellectible:', { endpoint, initBody });

      const initRes = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(initBody)
      });

      // Read raw text and try to parse JSON so we can log both
      const initText = await initRes.text().catch(() => null);
      let initJson: any = {};
      try {
        initJson = initText ? JSON.parse(initText) : {};
      } catch (e) {
        // If parsing fails, keep initJson as empty and log the parse error
        console.warn('Failed to parse initialize response JSON:', e);
      }

      // Log detailed response info
      console.log('initialize response:', {
        status: initRes.status,
        statusText: initRes.statusText,
        headers: Array.from(initRes.headers.entries()),
        text: initText,
        json: initJson
      });

      // Robustly extract sceneRecordId and userRecordId from various possible response shapes.
      const safeParse = (val: any) => {
        if (!val) return undefined;
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch { return undefined; }
        }
        return val;
      };

      // Normalize result which might be an object or a JSON string
      const normalizedResult = safeParse(initJson?.result) ?? initJson?.result;
      const normalizedRoot = safeParse(initJson) ?? initJson;

      const findId = (obj: any, key: string) => {
        if (!obj) return undefined;
        // common locations
        return obj?.outputs?.[key] ?? obj?.[key] ?? obj?.result?.outputs?.[key] ?? obj?.result?.[key] ?? undefined;
      };

      const resolvedSceneRecordId = findId(normalizedResult, 'sceneRecordId') ?? findId(normalizedRoot, 'sceneRecordId');
      const resolvedUserRecordId = findId(normalizedResult, 'userRecordId') ?? findId(normalizedRoot, 'userRecordId');

      console.log('Resolved sceneRecordId from initialize response:', resolvedSceneRecordId);
      console.log('Resolved userRecordId from initialize response:', resolvedUserRecordId);

      // Close modal and navigate to glb screen
      setShowPromptModal(false);
      // navigate to the party viewer — using the existing route used elsewhere
      router.push('/party/1');

    } catch (err) {
      console.error('Create party error:', err);
      // If an Error with message was thrown above, display it in the modal; otherwise fallback to a generic message
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to create party. See console for details.');
    } finally {
      setCreating(false);
    }
  };

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

      {/* Create Party Button (only show if logged in) */}

      {session?.user?.email && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowPromptModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg text-lg font-bold transition"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Party'}
          </button>
        </div>
      )}

      {/* Features Section */}
      <Features />

      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white text-black rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-2">Enter a prompt for your scene</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-2 border rounded mb-4"
              placeholder="Describe the scene you want to create..."
            />
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => { setShowPromptModal(false); setPrompt(''); setError(null); }}
                disabled={creating}
              >Cancel</button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={createParty}
                disabled={creating}
              >{creating ? 'Creating...' : 'Create & Generate'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}