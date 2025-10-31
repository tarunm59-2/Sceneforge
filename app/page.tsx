import { Sparkles } from 'lucide-react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import NavBar from '@/components/NavBar';

export default function Home() {
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

      {/* Create Party Button */}
      <div className="flex justify-center mt-8">
        <a href="/party/1" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg text-lg font-bold transition">Create Party</a>
      </div>

      {/* Features Section */}
      <Features />
    </div>
  );
}