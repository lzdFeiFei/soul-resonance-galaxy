# Soul Resonance React 重构计划

## 项目概述

Soul Resonance 是一个极简主义的情绪可视化交互应用，将用户的思绪转化为粒子流场和声波动态，通过"共鸣"机制在虚拟宇宙中寻找回声。原项目使用 Vanilla JS 实现，现需重构为现代 React + TypeScript 架构。

## 核心价值保留

### ✨ 必须完整保留的特色功能
1. **粒子流场系统**：400个粒子基于伪噪声函数的自然漩涡流动
2. **16根动态声波**：Header 右侧的正弦波叠加算法音频可视化  
3. **3阶段状态流转**：输入 → 共鸣(Loading+Result) → 星系漫游
4. **精致视觉设计**：液态玻璃质感、极细线条、坍缩动画
5. **智能星系布局**：黄金角度螺旋 + 避让逻辑
6. **回声交互面板**：侧滑面板 + 嵌入粒子动画

### 🎨 视觉规范严格遵循
- **背景**：深空黑 (#050605) + 噪声纹理叠加
- **主色**：Soul Gold `rgba(210, 190, 160, 0.9)`
- **辅色**：Muted Grey `rgba(143, 150, 147, 0.4)`
- **动画**：scale(0.92) + blur 坍缩效果
- **字体**：Playfair Display + Noto Serif SC

## React 架构设计

### 📁 项目结构
```
src/
├── components/           # UI组件层
│   ├── layout/
│   │   ├── Header.tsx           # LOGO + 声波组件
│   │   └── NoiseOverlay.tsx     # 噪声纹理
│   ├── canvas/
│   │   ├── ParticleCanvas.tsx   # 主粒子系统
│   │   ├── HeaderWave.tsx       # 16根声波
│   │   └── EchoCanvas.tsx       # 回声面板粒子
│   ├── stages/
│   │   ├── InputStage.tsx       # 输入阶段
│   │   ├── LoadingStage.tsx     # 共鸣加载
│   │   ├── ResultStage.tsx      # 生成结果
│   │   └── GalaxyStage.tsx      # 星系漫游
│   ├── panels/
│   │   └── EchoPanel.tsx        # 侧滑回声面板
│   └── ui/
│       ├── GlassButton.tsx      # 磨砂玻璃按钮
│       └── TypewriterText.tsx   # 打字机效果
├── hooks/                # 业务逻辑层
│   ├── useParticleSystem.ts     # 粒子系统逻辑
│   ├── useGalaxyLayout.ts       # 星系布局算法
│   ├── useWaveAnimation.ts      # 声波动画
│   ├── useResonance.ts          # 共鸣生成逻辑
│   └── useCamera.ts             # 视角控制
├── stores/               # 状态管理 (Zustand)
│   ├── appStore.ts              # 全局应用状态
│   ├── galaxyStore.ts           # 星系和粒子数据
│   └── canvasStore.ts           # Canvas 状态
├── utils/                # 工具函数
│   ├── particlePhysics.ts       # 粒子物理算法
│   ├── galaxyMath.ts            # 黄金角度、避让算法
│   ├── animations.ts            # 动画工具函数
│   └── constants.ts             # 配置常量
├── types/                # TypeScript 类型
│   ├── particles.ts
│   ├── galaxy.ts
│   └── app.ts
└── styles/               # 样式系统
    ├── globals.css              # CSS Variables
    └── components/              # 组件专用样式
```

### 🏗 核心状态管理 (Zustand)

#### AppStore - 全局应用状态
```typescript
interface AppState {
  stage: 'input' | 'loading' | 'result' | 'galaxy_view'
  viewingTarget: 'me' | string  // 'me' 或他者星系ID
  currentInput: string
  currentAIResponse: AIResponse | null
  
  // Actions
  setStage: (stage: AppState['stage']) => void
  setInput: (input: string) => void
  generateResonance: () => Promise<void>
  saveToGalaxy: () => void
}
```

#### GalaxyStore - 星系数据管理
```typescript
interface GalaxyState {
  userParticles: UserParticle[]
  otherGalaxies: OtherGalaxy[]
  cameraOffset: { x: number, y: number }
  
  // Actions  
  addUserParticle: (particle: UserParticle) => void
  addOtherGalaxy: (galaxy: OtherGalaxy) => void
  updateCamera: (offset: { x: number, y: number }) => void
}
```

#### CanvasStore - Canvas 交互状态
```typescript
interface CanvasState {
  mousePosition: { x: number | null, y: number | null }
  hoveredParticle: Particle | null
  canvas: {
    width: number
    height: number
  }
  
  // Actions
  updateMouse: (x: number | null, y: number | null) => void
  setHoveredParticle: (particle: Particle | null) => void
}
```

### ⚡ 核心Hooks设计

#### useParticleSystem - 粒子系统核心
```typescript
const useParticleSystem = () => {
  // 粒子物理引擎
  // 流场算法 (伪噪声函数)
  // 鼠标交互检测
  // 渲染循环管理
}
```

#### useGalaxyLayout - 星系布局算法
```typescript  
const useGalaxyLayout = () => {
  // 黄金角度螺旋排列
  // 避让逻辑 (避开UI禁区)
  // 星系间距离计算
  // 摄像机平滑移动
}
```

#### useWaveAnimation - 声波动画
```typescript
const useWaveAnimation = () => {
  // 16根声波的正弦波叠加
  // "高-低-高"节奏排列
  // 金色与灰色交替
  // 实时频率模拟
}
```

## 🎯 实施阶段规划

### Phase 1: 基础架构 (Day 1-2)
- [ ] 初始化 React + TypeScript + Tailwind 项目
- [ ] 设置 Zustand 状态管理
- [ ] 创建基础组件结构
- [ ] 实现 CSS Variables 设计系统

### Phase 2: 核心视觉系统 (Day 3-4)  
- [ ] 实现粒子系统和流场算法
- [ ] 创建 16根动态声波组件
- [ ] 实现噪声纹理和背景效果
- [ ] 添加液态玻璃质感元素

### Phase 3: 交互流程 (Day 5-6)
- [ ] 实现输入阶段UI
- [ ] 创建 Loading 扫描动画 
- [ ] 实现结果展示 (打字机效果)
- [ ] 添加坍缩保存动画

### Phase 4: 星系系统 (Day 7-8)
- [ ] 实现星系布局和渲染
- [ ] 添加黄金角度螺旋算法
- [ ] 创建避让逻辑系统
- [ ] 实现摄像机平滑移动

### Phase 5: 高级交互 (Day 9-10)
- [ ] 实现回声面板组件
- [ ] 添加侧滑动画效果  
- [ ] 创建嵌入式粒子动画
- [ ] 实现粒子点击检测

### Phase 6: 优化完善 (Day 11-12)
- [ ] 性能优化 (Canvas渲染、内存管理)
- [ ] 动画流畅度调优
- [ ] 响应式适配
- [ ] 细节打磨和BUG修复

## 🚀 技术实现要点

### Canvas 渲染优化
- 使用 `requestAnimationFrame` 优化渲染循环
- 实现视口裁剪，只渲染可见粒子
- 使用 OffscreenCanvas 进行后台计算
- WebGL 升级支持 (可选)

### 状态同步机制
- Canvas 动画与 React 状态的解耦
- 使用 useRef 避免重复渲染
- 合理使用 useMemo/useCallback 缓存

### 动画性能优化  
- CSS Transform 硬件加速
- 避免 DOM 回流重绘
- 粒子对象池复用
- 时间切片渲染大量粒子

### TypeScript 类型安全
- 严格的粒子、星系数据类型定义
- Canvas 上下文类型增强
- 动画状态类型保护
- Hook 返回值精确类型

## 🎨 视觉还原标准

### 粒子系统精度要求
- ✅ 400个粒子，5种颜色随机分配
- ✅ 鼠标180px范围内响应 
- ✅ 流场基于 sin/cos 伪噪声算法
- ✅ 坍缩动画：scale(0.92) + blur(5px)

### 声波动画精度要求  
- ✅ 16根竖条，1px线宽，5px间距
- ✅ "高-低-高"节奏，中间高两边低
- ✅ 金色与灰色交替
- ✅ 正弦波叠加产生自然律动

### 星系布局精度要求
- ✅ 黄金角度 (137.5°) 螺旋排列
- ✅ 避开屏幕底部中央区域
- ✅ 摄像机平滑缓动到目标
- ✅ 星系间最小距离限制

## 🔮 未来扩展规划

### AI 集成准备
- 预留 LLM API 接口
- MusicGen 音频生成集成点
- 情绪分析模块架构

### 数据持久化
- Firebase/Supabase 集成准备
- 用户星系云端同步
- 多用户实时交互基础

### 性能极致优化
- WebGL 渲染引擎升级
- Web Workers 后台计算
- WebAssembly 物理引擎

---

**目标：完美还原原版的每一个像素、每一帧动画、每一个交互细节，同时提供现代 React 架构的可维护性和扩展性。**