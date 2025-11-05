"use client"

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // Create scene state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join scene state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sceneId, setSceneId] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!session?.user?.email) {
    router.push('/');
    return null;
  }

  // Create scene flow (previously createParty)
  const createScene = async () => {
    if (creating) return;
    setCreateError(null);

    // Prompt required
    if (!prompt || prompt.trim().length === 0) {
      setCreateError('Please enter a prompt');
      return;
    }

    setCreating(true);

    try {
      // Call Intellectible directly from the client
      const endpoint = 'https://app.intellectible.com/api/publicv1/projects/-Ocwpv-hOQbSt8QI9OXI/workflows/-Ocy2s_2Ry0x76DcnSxY/runsync';
      const apiKey = process.env.NEXT_PUBLIC_INTELLECTIBLE_API_KEY || 'YOUR_API_KEY';
      const headers: Record<string,string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey
      };

      const name = session?.user?.name ?? session?.user?.email ?? 'unknown';
      const email = session?.user?.email ?? '';

      // Generate a 15-digit numeric scene_id (client-side)
      const generateRandomDigits = (len = 15) => {
        const digits = '0123456789';
        try {
          const arr = new Uint8Array(len);
          crypto.getRandomValues(arr);
          return Array.from(arr, (v) => digits[v % digits.length]).join('');
        } catch {
          let s = '';
          for (let i = 0; i < len; i++) {
            s += digits.charAt(Math.floor(Math.random() * 10));
          }
          return s;
        }
      };

      const generatedSceneId = generateRandomDigits(15);

      // Initialize with inputs
      const initBody = {
        runEvent: 'initialize',
        inputs: {
          name,
          email,
          prompt,
          scene_id: generatedSceneId
        }
      };

      console.log('Sending initialize request to Intellectible:', { endpoint, initBody });

      const initRes = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(initBody)
      });

      const initText = await initRes.text().catch(() => null);

      console.log('initialize response raw:', {
        status: initRes.status,
        statusText: initRes.statusText,
        headers: Array.from(initRes.headers.entries()),
        text: initText
      });

      // Close modal and navigate to scene viewer
      setShowCreateModal(false);
      router.push('/party/1');

    } catch (err) {
      console.error('Create scene error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setCreateError(message || 'Failed to create scene. See console for details.');
    } finally {
      setCreating(false);
    }
  };

  // Join scene flow
  const joinScene = async () => {
    if (joining) return;
    setJoinError(null);

    // Scene ID required
    if (!sceneId || sceneId.trim().length === 0) {
      setJoinError('Please enter a scene ID');
      return;
    }

    setJoining(true);

    try {
      const email = session?.user?.email ?? '';
      const name = session?.user?.name ?? session?.user?.email ?? 'unknown';

      // Step 1: Insert user first
      const insertUserEndpoint = 'https://app.intellectible.com/api/publicv1/projects/-Ocwpv-hOQbSt8QI9OXI/workflows/-OdK_wMbCpTEH0aXVKoA/runsync';
      const apiKey = process.env.NEXT_PUBLIC_INTELLECTIBLE_API_KEY || 'YOUR_API_KEY';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey
      };

      const insertUserBody = {
        runEvent: 'insertuser',
        inputs: {
          name: name,
          email: email
        }
      };

      console.log('Inserting user:', { insertUserEndpoint, insertUserBody });

      const insertUserRes = await fetch(insertUserEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(insertUserBody)
      });

      const insertUserText = await insertUserRes.text();
      console.log('Insert user raw response:', insertUserText);

      // Step 2: Check if user already exists in the scene
      const existsEndpoint = 'https://app.intellectible.com/api/publicv1/projects/-Ocwpv-hOQbSt8QI9OXI/workflows/-OdHmSNkeL2YjhgrxNoF/runsync';

      const existsBody = {
        runEvent: 'existsinscene',
        inputs: {
          email: email
        }
      };

      console.log('Checking if user exists in scene:', { existsEndpoint, existsBody });

      const existsRes = await fetch(existsEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(existsBody)
      });

      const existsText = await existsRes.text();
      console.log('Exists check raw response:', existsText);

      // Parse the response
      const existsData = JSON.parse(existsText);
      const exists = existsData?.result?.outputs?.exists;

      console.log('User exists in scene:', exists);

      // Step 2: If user doesn't exist, get the lists and append email
      if (!exists) {
        const listsEndpoint = 'https://app.intellectible.com/api/publicv1/projects/-Ocwpv-hOQbSt8QI9OXI/workflows/-OdKcQ1A28UbBTei6URP/runsync';

        const listsBody = {
          runEvent: 'userinscene',
          inputs: {
            scene_id: sceneId
          }
        };

        console.log('Getting lists for scene:', { listsEndpoint, listsBody });

        const listsRes = await fetch(listsEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(listsBody)
        });

        const listsText = await listsRes.text();
        console.log('Lists raw response:', listsText);

        // Parse the response
        const listsData = JSON.parse(listsText);
        const list = listsData?.result?.outputs?.list || '';

        // Append email to the list string
        const finalString = list + email + ', ';
        console.log('Final string with appended email:', finalString);

        // Step 3: Add user to scene with the constructed userlist
        const addUserEndpoint = 'https://app.intellectible.com/api/publicv1/projects/-Ocwpv-hOQbSt8QI9OXI/workflows/-OdKlwFaqFeoAoTvQPMl/runsync';

        const addUserBody = {
          runEvent: 'addusertoscene',
          inputs: {
            scene_id: sceneId,
            userlist: finalString
          }
        };

        console.log('Adding user to scene:', { addUserEndpoint, addUserBody });

        const addUserRes = await fetch(addUserEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(addUserBody)
        });

        const addUserText = await addUserRes.text();
        console.log('Add user raw response:', addUserText);

        // Parse the response
        const addUserData = JSON.parse(addUserText);
        const row = addUserData?.result?.outputs?.row;

        console.log('Row:', row);
      }

      // Close modal and navigate to scene viewer
      setShowJoinModal(false);
      router.push('/party/1');

    } catch (err) {
      console.error('Join scene error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setJoinError(message || 'Failed to join scene. See console for details.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <NavBar />

      {/* Dashboard Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Create immersive 3D scenes or join existing ones
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-4xl mx-auto mb-16">
          {/* Create Scene Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative w-full md:w-80 h-64 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-blue-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-3xl font-bold mb-2">Create a Scene</h2>
              <p className="text-blue-200 text-center">Start building your own 3D world</p>
            </div>
          </button>

          {/* Join Scene Button */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="group relative w-full md:w-80 h-64 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-teal-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
              <div className="text-6xl mb-4">🚪</div>
              <h2 className="text-3xl font-bold mb-2">Join a Scene</h2>
              <p className="text-teal-200 text-center">Enter an existing scene with ID</p>
            </div>
          </button>
        </div>

        {/* My Available Scenes */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">My Available Scenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder Scene Cards */}
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer border border-gray-700"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🎬</div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                </div>

                {/* Scene Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">Scene {index}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    A placeholder scene description that will be replaced with actual scene data
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created 2 days ago</span>
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded">Active</span>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <button className="px-6 py-2 bg-white text-blue-900 rounded-lg font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    Open Scene
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="text-center text-gray-400">
          <p>Logged in as {session?.user?.email}</p>
        </div>
      </div>

      {/* Create Scene Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-blue-500/30">
            <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              Create Your Scene
            </h3>
            <p className="text-gray-300 mb-6">Describe the 3D scene you want to create</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-40 p-4 bg-gray-800 border border-gray-700 rounded-xl mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., A futuristic city with neon lights, flying cars, and towering skyscrapers..."
            />
            {createError && <div className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-lg">{createError}</div>}
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition"
                onClick={() => { setShowCreateModal(false); setPrompt(''); setCreateError(null); }}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-xl transition disabled:opacity-50"
                onClick={createScene}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Scene'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Scene Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-teal-500/30">
            <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
              Join a Scene
            </h3>
            <p className="text-gray-300 mb-6">Enter the Scene ID to join an existing scene</p>
            <input
              type="text"
              value={sceneId}
              onChange={(e) => setSceneId(e.target.value)}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter 15-digit Scene ID..."
            />
            {joinError && <div className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-lg">{joinError}</div>}
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition"
                onClick={() => { setShowJoinModal(false); setSceneId(''); setJoinError(null); }}
                disabled={joining}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 rounded-xl transition disabled:opacity-50"
                onClick={joinScene}
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join Scene'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
