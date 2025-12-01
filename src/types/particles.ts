export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: ParticleColor;
  size: number;
  alpha: number;
  isUser?: boolean;
  text?: string;
  aiResponse?: any;
  timestamp?: number;
}

export interface ParticleColor {
  r: number;
  g: number;
  b: number;
}

export interface FlowField {
  width: number;
  height: number;
  resolution: number;
  vectors: Array<{ angle: number; magnitude: number }>;
}

export interface ParticleSystemConfig {
  particleCount: number;
  mouseDistance: number;
  colors: ParticleColor[];
  flowField: {
    noise: {
      scale: number;
      strength: number;
      speed: number;
    };
  };
}