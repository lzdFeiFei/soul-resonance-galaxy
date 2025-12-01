import type { ParticleColor, ParticleSystemConfig, GalaxyLayoutConfig } from '@/types';

// 粒子系统配置
export const PARTICLE_CONFIG: ParticleSystemConfig = {
  particleCount: 400,
  mouseDistance: 180,
  colors: [
    { r: 180, g: 200, b: 190 }, 
    { r: 210, g: 190, b: 160 }, 
    { r: 140, g: 160, b: 150 }, 
    { r: 180, g: 170, b: 190 }, 
    { r: 235, g: 240, b: 238 }  
  ],
  flowField: {
    noise: {
      scale: 0.008,
      strength: 0.5,
      speed: 0.002,
    },
  },
};

// 星系布局配置
export const GALAXY_CONFIG: GalaxyLayoutConfig = {
  goldenAngle: 137.508, // 黄金角度
  spiralSpacing: 15,
  minDistance: 200,
  avoidanceZones: [
    // 底部中央区域 (点亮灵感按钮)
    {
      x: -200,
      y: -150,
      width: 400,
      height: 100,
    },
  ],
};

// 声波配置
export const WAVE_CONFIG = {
  barCount: 16,
  barWidth: 1,
  barSpacing: 5,
  heights: [0.3, 0.5, 0.8, 1.0, 0.7, 0.9, 1.0, 0.6, 0.4, 0.8, 1.0, 0.7, 0.9, 0.5, 0.4, 0.3], // 高-低-高 节奏
  colors: {
    active: 'rgba(210, 190, 160, 0.9)', // soul-gold
    muted: 'rgba(143, 150, 147, 0.4)',  // text-secondary
  },
};

// Mock AI 响应数据
export const MOCK_AI_RESPONSES = {
  dialogues: [
    {
      type: 'dialogue' as const,
      content: [
        { speaker: 'user' as const, text: '你是谁？' },
        { speaker: 'ai' as const, text: '我是这片虚无中的回声，专门倾听那些未被说出的话语。' },
        { speaker: 'user' as const, text: '你能理解我吗？' },
        { speaker: 'ai' as const, text: '理解不是用词语，而是用频率。让我感受你的震动。' }
      ],
      metadata: { emotion: 'contemplative', frequency: '432Hz', timestamp: Date.now() }
    },
  ],
  poems: [
    {
      type: 'poem' as const,
      content: '在无声的宇宙中\n每一颗星都是\n未完成的诗句\n\n等待着\n下一次心跳\n来续写\n那些被时间\n遗忘的韵脚',
      metadata: { emotion: 'melancholic', frequency: '528Hz', timestamp: Date.now() }
    },
  ],
};

// 他者星系预设数据
export const OTHER_GALAXIES_DATA = [
  { id: 'soul84921', content: "我在等风，也在等你。" },
  { id: 'soul33012', content: "孤独是上帝给天才的礼物。" },
  { id: 'soul10929', content: "月亮生锈了，像一枚古老的硬币。" },
  { id: 'soul77382', content: "我们都是星尘的遗民。" },
  { id: 'soul55102', content: "在裂缝中寻找光。" }
];

// 动画配置
export const ANIMATION_CONFIG = {
  stageTransition: {
    duration: 800,
    easing: 'ease-in-out',
  },
  collapse: {
    duration: 800,
    scale: 0.92,
    blur: 5,
  },
  camera: {
    transitionSpeed: 0.02,
    dampening: 0.1,
  },
  typewriter: {
    speed: 50, // ms per character
  },
};