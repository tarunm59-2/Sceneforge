'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

// Type definitions for the CDN-loaded classes
interface OrbitControlsType {
  new (camera: THREE.Camera, domElement: HTMLElement): OrbitControlsInstance;
}

interface OrbitControlsInstance {
  enableDamping: boolean;
  dampingFactor: number;
  target: THREE.Vector3;
  update(): void;
  dispose(): void;
}

interface GLTFLoaderType {
  new (): GLTFLoaderInstance;
}

interface GLTFLoaderInstance {
  parse(
    data: ArrayBuffer,
    path: string,
    onLoad: (gltf: { scene: THREE.Object3D }) => void,
    onError: (error: Error) => void
  ): void;
}

// Declare types for the loaders
declare global {
  interface Window {
    THREE: typeof THREE & {
      GLTFLoader: GLTFLoaderType;
      OrbitControls: OrbitControlsType;
    };
  }
}

// Helper component for file upload
function FileUpload({ onFile }: { onFile: (file: File) => void }) {
  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".gltf,.glb"
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            onFile(e.target.files[0]);
          }
        }}
        className="block w-full text-sm text-blue-200 bg-white/10 rounded-lg border border-white/20 p-2"
      />
    </div>
  );
}

export default function SceneViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sceneName, setSceneName] = useState<string>('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [loadersReady, setLoadersReady] = useState(false);
  const router = useRouter();

  // Store Three.js objects so we can clean up
  const threeObjects = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControlsInstance;
    animationId?: number;
    model?: THREE.Object3D;
  }>({});

  // Load Three.js addons from CDN
  useEffect(() => {
    window.THREE = THREE as typeof THREE & {
      GLTFLoader: GLTFLoaderType;
      OrbitControls: OrbitControlsType;
    };

    const loadScripts = async () => {
      const gltfScript = document.createElement('script');
      gltfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/GLTFLoader.js';
      document.head.appendChild(gltfScript);

      const controlsScript = document.createElement('script');
      controlsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js';
      document.head.appendChild(controlsScript);

      await Promise.all([
        new Promise(resolve => { gltfScript.onload = resolve; }),
        new Promise(resolve => { controlsScript.onload = resolve; })
      ]);

      setLoadersReady(true);
    };

    loadScripts();
  }, []);

  // Clean up Three.js scene
  const cleanup = () => {
    const { renderer, controls, animationId, scene, model } = threeObjects.current;
    if (animationId) cancelAnimationFrame(animationId);
    if (controls) controls.dispose();
    if (renderer) renderer.dispose();
    if (scene && model) scene.remove(model);
    if (mountRef.current) mountRef.current.innerHTML = '';
    threeObjects.current = {};
  };

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const { camera } = threeObjects.current;
      if (!camera) return;
      const step = 0.2;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();
      switch (e.key) {
        case 'ArrowUp':
          camera.position.add(forward.clone().multiplyScalar(step));
          break;
        case 'ArrowDown':
          camera.position.add(forward.clone().multiplyScalar(-step));
          break;
        case 'ArrowLeft':
          camera.position.add(right.clone().multiplyScalar(-step));
          break;
        case 'ArrowRight':
          camera.position.add(right.clone().multiplyScalar(step));
          break;
        case 'Escape':
          setShowExitModal(true);
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load GLTF/GLB file
  const handleFile = (file: File) => {
    if (!loadersReady) {
      setError('Loaders not ready yet, please wait...');
      return;
    }

    setLoading(true);
    setError(null);
    setSceneName(file.name);
    cleanup();

    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer) return setError('Failed to read file');

      const GLTFLoader = window.THREE.GLTFLoader;
      const OrbitControls = window.THREE.OrbitControls;

      // Setup Three.js scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x101820);
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
      camera.position.set(2, 2, 4);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x101820);
      if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);
      const directional = new THREE.DirectionalLight(0xffffff, 0.8);
      directional.position.set(5, 10, 7.5);
      scene.add(directional);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.target.set(0, 1, 0);
      controls.update();

      // Load model
      const loader = new GLTFLoader();
      loader.parse(
        arrayBuffer as ArrayBuffer,
        '',
        (gltf) => {
          const model = gltf.scene;
          scene.add(model);
          threeObjects.current.model = model;
          setLoading(false);
          animate();
          // Navigate to /party/1 after successful load
          router.push('/party/1');
        },
        (err) => {
          setError('Failed to load model: ' + err.message);
          setLoading(false);
        }
      );

      // Animation loop
      function animate() {
        controls.update();
        renderer.render(scene, camera);
        threeObjects.current.animationId = requestAnimationFrame(animate);
      }

      // Store refs for cleanup
      threeObjects.current = { renderer, scene, camera, controls };
    };
    reader.readAsArrayBuffer(file);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-50 bg-black"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Arrow button overlay */}
      <button
        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg z-60"
        aria-label="Go Back"
        onClick={() => router.push('/')}
        style={{ fontSize: '2rem', lineHeight: 1 }}
      >
        &#8592;
      </button>
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 text-blue-200 bg-black/70 p-2 rounded">
        <h2 className="text-2xl font-bold">3D Scene Viewer</h2>
        {!loadersReady && <div className="mt-2 text-yellow-300">Loading 3D libraries...</div>}
        {loadersReady && <FileUpload onFile={handleFile} />}
        {sceneName && (
          <div className="mb-2 text-blue-100/80 text-sm">Viewing: {sceneName}</div>
        )}
        {loading && <div className="mt-4 text-blue-200">Loading...</div>}
        {error && <div className="mt-4 text-red-400">{error}</div>}
        <div className="mt-2 text-xs text-blue-100/60">Use arrow keys to move, Escape to quit</div>
      </div>
      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-60">
          <div className="bg-white rounded-lg p-6 shadow-xl text-black w-80">
            <h3 className="text-lg font-bold mb-4">Are you sure you want to exit?</h3>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowExitModal(false)}
              >No</button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => router.push('/')}
              >Yes, Exit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}