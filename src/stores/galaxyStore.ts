import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Galaxy, CameraState, GalaxyParticle } from '@/types/galaxy';
import type { UserParticle, OtherGalaxy } from '@/types/app';
import { GALAXY_CONFIG, OTHER_GALAXIES_DATA } from '@/utils/constants';

interface GalaxyState {
  // 星系数据
  userGalaxy: Galaxy;
  otherGalaxies: Galaxy[];
  
  // 摄像机状态
  camera: CameraState;
  viewingTarget: 'user' | string; // 'user' 或者其他星系 ID
  
  // Actions
  addUserParticle: (particle: UserParticle) => void;
  addOtherGalaxy: (galaxy: OtherGalaxy) => void;
  updateCamera: (target: { x: number; y: number }, smooth?: boolean) => void;
  setViewingTarget: (target: 'user' | string) => void;
  
  // 辅助方法
  getUserParticleById: (id: string) => GalaxyParticle | null;
  getGalaxyById: (id: string) => Galaxy | null;
}

// 黄金角度螺旋布局算法
const calculateSpiralPosition = (index: number): { x: number; y: number } => {
  const angle = index * GALAXY_CONFIG.goldenAngle * (Math.PI / 180);
  const radius = Math.sqrt(index) * GALAXY_CONFIG.spiralSpacing;
  
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

// 避让逻辑：检查位置是否在禁区内
const isPositionValid = (position: { x: number; y: number }): boolean => {
  return !GALAXY_CONFIG.avoidanceZones.some(zone => 
    position.x >= zone.x && 
    position.x <= zone.x + zone.width &&
    position.y >= zone.y && 
    position.y <= zone.y + zone.height
  );
};

// 为他者星系生成随机位置 (避开禁区)
const generateRandomPosition = (): { x: number; y: number } => {
  let position: { x: number; y: number };
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    position = {
      x: (Math.random() - 0.5) * window.innerWidth * 0.8,
      y: (Math.random() - 0.5) * window.innerHeight * 0.8,
    };
    attempts++;
  } while (!isPositionValid(position) && attempts < maxAttempts);
  
  return position;
};

export const useGalaxyStore = create<GalaxyState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    userGalaxy: {
      id: 'user-galaxy',
      type: 'user',
      position: { x: 0, y: 100 }, // 屏幕中下方
      particles: [],
      metadata: {
        level: 1,
        particleCount: 0,
      },
    },
    
    otherGalaxies: OTHER_GALAXIES_DATA.map((data, index) => ({
      id: data.id,
      type: 'other' as const,
      position: generateRandomPosition(),
      particles: [{
        id: `${data.id}_particle`,
        position: { x: 0, y: 0 },
        angle: 0,
        radius: 0,
        color: { r: 140, g: 160, b: 150 }, // soul-green
        text: data.content,
        timestamp: Date.now() - (index * 86400000), // 错开时间
      }],
    })),
    
    camera: {
      position: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      zoom: 1,
      isTransitioning: false,
    },
    
    viewingTarget: 'user',

    // Actions
    addUserParticle: (particle) => set((state) => {
      const newParticleIndex = state.userGalaxy.particles.length;
      const spiralPosition = calculateSpiralPosition(newParticleIndex);
      
      const newParticle: GalaxyParticle = {
        id: particle.id,
        position: spiralPosition,
        angle: newParticleIndex * GALAXY_CONFIG.goldenAngle,
        radius: Math.sqrt(newParticleIndex) * GALAXY_CONFIG.spiralSpacing,
        color: particle.color,
        text: particle.text,
        aiResponse: particle.aiResponse,
        timestamp: particle.timestamp,
      };

      return {
        userGalaxy: {
          ...state.userGalaxy,
          particles: [...state.userGalaxy.particles, newParticle],
          metadata: {
            ...state.userGalaxy.metadata,
            particleCount: state.userGalaxy.particles.length + 1,
          },
        },
      };
    }),

    addOtherGalaxy: (galaxy) => set((state) => {
      const position = generateRandomPosition();
      
      const newGalaxy: Galaxy = {
        id: galaxy.id,
        type: 'other',
        position,
        particles: [{
          id: `${galaxy.id}_particle`,
          position: { x: 0, y: 0 },
          angle: 0,
          radius: 0,
          color: { r: 180, g: 170, b: 190 }, // soul-purple
          text: galaxy.content,
          timestamp: Date.now(),
        }],
      };

      return {
        otherGalaxies: [...state.otherGalaxies, newGalaxy],
      };
    }),

    updateCamera: (target, smooth = true) => set((state) => {
      if (smooth) {
        return {
          camera: {
            ...state.camera,
            target,
            isTransitioning: true,
          },
        };
      } else {
        return {
          camera: {
            ...state.camera,
            position: target,
            target,
            isTransitioning: false,
          },
        };
      }
    }),

    setViewingTarget: (target) => set((state) => {
      let cameraTarget: { x: number; y: number };
      
      if (target === 'user') {
        cameraTarget = state.userGalaxy.position;
      } else {
        const galaxy = state.otherGalaxies.find(g => g.id === target);
        cameraTarget = galaxy?.position || { x: 0, y: 0 };
      }
      
      return {
        viewingTarget: target,
        camera: {
          ...state.camera,
          target: cameraTarget,
          isTransitioning: true,
        },
      };
    }),

    // 辅助方法
    getUserParticleById: (id) => {
      const { userGalaxy } = get();
      return userGalaxy.particles.find(p => p.id === id) || null;
    },

    getGalaxyById: (id) => {
      const { userGalaxy, otherGalaxies } = get();
      if (id === 'user-galaxy') return userGalaxy;
      return otherGalaxies.find(g => g.id === id) || null;
    },
  }))
);