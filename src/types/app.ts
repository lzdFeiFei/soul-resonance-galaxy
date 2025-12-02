export type AppStage = 'input' | 'loading' | 'result' | 'galaxy_view';

export interface AIResponse {
  type: 'dialogue' | 'poem' | 'mixed';
  content: string | DialogueItem[];
  metadata: {
    emotion?: string;
    frequency?: string;
    timestamp: number;
  };
}

export interface DialogueItem {
  speaker: 'user' | 'ai';
  text: string;
}

export interface UserParticle {
  id: string;
  text: string;
  aiResponse: AIResponse;
  position: { x: number; y: number };
  timestamp: number;
  color: ParticleColor;
}

export interface OtherGalaxy {
  id: string;
  content: string;
  position: { x: number; y: number };
  particles: UserParticle[];
}

export interface ParticleColor {
  r: number;
  g: number;
  b: number;
}