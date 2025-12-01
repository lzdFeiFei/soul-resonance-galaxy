import { create } from 'zustand';
import type { Particle } from '@/types/particles';

interface CanvasState {
  // Canvas 尺寸
  canvas: {
    width: number;
    height: number;
  };
  
  // 鼠标状态
  mouse: {
    x: number | null;
    y: number | null;
    isMoving: boolean;
  };
  
  // 交互状态
  hoveredParticle: Particle | null;
  
  // 渲染状态
  isAnimating: boolean;
  frameCount: number;
  lastFrameTime: number;
  
  // Actions
  updateCanvasSize: (width: number, height: number) => void;
  updateMousePosition: (x: number | null, y: number | null) => void;
  setHoveredParticle: (particle: Particle | null) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  incrementFrame: () => void;
  
  // 工具方法
  getMouseDistance: (x: number, y: number) => number;
  isMouseInRange: (x: number, y: number, range: number) => boolean;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  canvas: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  
  mouse: {
    x: null,
    y: null,
    isMoving: false,
  },
  
  hoveredParticle: null,
  isAnimating: false,
  frameCount: 0,
  lastFrameTime: 0,

  // Actions
  updateCanvasSize: (width, height) => set((state) => ({
    canvas: { width, height }
  })),

  updateMousePosition: (x, y) => set((state) => {
    const wasMoving = state.mouse.isMoving;
    const isMoving = x !== null && y !== null;
    
    return {
      mouse: { x, y, isMoving },
    };
  }),

  setHoveredParticle: (particle) => set({ hoveredParticle: particle }),

  startAnimation: () => set({ 
    isAnimating: true, 
    lastFrameTime: performance.now() 
  }),
  
  stopAnimation: () => set({ isAnimating: false }),

  incrementFrame: () => set((state) => {
    const now = performance.now();
    return {
      frameCount: state.frameCount + 1,
      lastFrameTime: now,
    };
  }),

  // 工具方法
  getMouseDistance: (x, y) => {
    const { mouse } = get();
    if (mouse.x === null || mouse.y === null) return Infinity;
    
    const dx = x - mouse.x;
    const dy = y - mouse.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  isMouseInRange: (x, y, range) => {
    const distance = get().getMouseDistance(x, y);
    return distance <= range;
  },
}));