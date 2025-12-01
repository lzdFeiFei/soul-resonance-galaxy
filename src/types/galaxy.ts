export interface Galaxy {
  id: string;
  position: { x: number; y: number };
  particles: GalaxyParticle[];
  type: 'user' | 'other';
  metadata?: {
    level?: number;
    particleCount?: number;
  };
}

export interface GalaxyParticle {
  id: string;
  position: { x: number; y: number };
  angle: number; // 黄金角度螺旋中的角度
  radius: number; // 距离中心的半径
  color: { r: number; g: number; b: number };
  text?: string;
  aiResponse?: any;
  timestamp?: number;
}

export interface CameraState {
  position: { x: number; y: number };
  target: { x: number; y: number };
  zoom: number;
  isTransitioning: boolean;
}

export interface GalaxyLayoutConfig {
  goldenAngle: number; // 137.508 degrees
  spiralSpacing: number;
  avoidanceZones: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  minDistance: number; // 星系间最小距离
}