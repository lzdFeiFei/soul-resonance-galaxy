export interface ParticleColor {
  r: number;
  g: number;
  b: number;
}

export interface ParticleSystemConfig {
  particleCount: number;
  particleSize: number;
  particleSpeed: number;
  particleOpacity: number;
  particleColors: ParticleColor[];
  colors?: ParticleColor[]; // 兼容别名
  particleConnectionDistance: number;
  particleConnectionOpacity: number;
  particleOrbitRadius: number;
  particleSpeedVariation: number;
  backgroundParticles: number;
  mouseInfluenceRadius: number;
  mouseForceMultiplier: number;
  mouseDistance?: number;
  flowField?: {
    noise: {
      scale: number;
      strength: number;
      speed: number;
    };
  };
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity?: number;
  alpha?: number; // 兼容别名
  color: ParticleColor;
  speed?: number;
  angle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  isUser?: boolean;
  text?: string;
  aiResponse?: any;
  timestamp?: number;
}

export interface FlowField {
  width: number;
  height: number;
  resolution: number;
  vectors: Array<{ angle: number; magnitude: number }>;
}