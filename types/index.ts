// Scene types
export interface Scene {
    id: string;
    name: string;
    prompt: string;
    gltfUrl: string;
    thumbnailUrl?: string;
    createdAt: Date;
    userId?: string;
  }
  
  // Waitlist types
  export interface WaitlistEntry {
    id: string;
    email: string;
    createdAt: Date;
  }
  
  // API Response types
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  // Feature types
  export interface Feature {
    icon: any; // Lucide icon component
    title: string;
    description: string;
    gradient: string;
  }