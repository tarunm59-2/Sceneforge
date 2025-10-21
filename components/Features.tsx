import { Zap, Globe, Sparkles } from 'lucide-react';
import type { Feature } from '@/types';

const features: Feature[] = [
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Type a description and get a fully explorable 3D scene in seconds. No 3D modeling skills required.",
    gradient: "from-blue-400 to-blue-600"
  },
  {
    icon: Globe,
    title: "Fully Interactive",
    description: "Walk through your scenes in first-person. Click objects, change lighting, and explore every corner.",
    gradient: "from-teal-400 to-teal-600"
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Powered by advanced AI that understands your vision and brings it to life with stunning detail.",
    gradient: "from-cyan-400 to-cyan-600"
  }
];

export default function Features() {
  return (
    <section className="relative z-10 container mx-auto px-6 py-20">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div 
              key={index}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className={`bg-gradient-to-br ${feature.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-blue-200/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}