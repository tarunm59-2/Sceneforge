import { Sparkles } from 'lucide-react';
import WaitlistForm from './WaitlistForm';
import SceneViewer from './SceneViewer';

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


    </section>
  );
}