import { Sparkles } from 'lucide-react';
import WaitlistForm from './WaitlistForm';

export default function Hero() {
  return (
    <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
      {/* Badge */}
      <div className="inline-block mb-6 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
        <span className="text-sm font-medium">🎉 Now in Early Access</span>
      </div>
      
      {/* Heading */}
      <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
        Turn Words Into
        <br />
        <span className="bg-gradient-to-r from-blue-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
          Explorable Worlds
        </span>
      </h1>
      
      {/* Subheading */}
      <p className="text-xl md:text-2xl text-blue-100/80 mb-12 max-w-3xl mx-auto leading-relaxed">
        Describe any scene in natural language. Watch as AI instantly creates 
        immersive 3D environments you can walk through, explore, and interact with.
      </p>

      {/* Waitlist Form */}
      <WaitlistForm />

      {/* Demo Preview Placeholder */}
      <div className="relative max-w-5xl mx-auto mt-16">
        <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 backdrop-blur-sm">
          <div className="aspect-video flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-200/50" />
              <p className="text-blue-200/70">3D Scene Viewer</p>
              <p className="text-sm text-blue-200/50 mt-2">Interactive demo coming soon</p>
            </div>
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-3xl"></div>
      </div>
    </section>
  );
}