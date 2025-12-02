import type { AvoidanceZone } from '@/types/galaxy';
import { GALAXY_CONFIG } from './constants';

/**
 * 黄金角度螺旋布局算法
 * 这是星系视图的核心算法，必须严格按照原版实现
 */

// 黄金角度 (度数)
const GOLDEN_ANGLE = 137.508;

// 将角度转换为弧度
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * 计算黄金角度螺旋中第 n 个粒子的位置
 * @param index 粒子索引 (从 0 开始)
 * @param centerX 螺旋中心 X 坐标
 * @param centerY 螺旋中心 Y 坐标  
 * @param spacing 螺旋间距
 */
export const calculateSpiralPosition = (
  index: number,
  centerX: number = 0,
  centerY: number = 0,
  spacing: number = GALAXY_CONFIG.spiralSpacing
): { x: number; y: number; angle: number; radius: number } => {
  // 黄金角度螺旋公式
  const angle = index * GOLDEN_ANGLE;
  const radius = Math.sqrt(index) * spacing;
  
  // 转换为笛卡尔坐标
  const angleRadians = toRadians(angle);
  const x = centerX + Math.cos(angleRadians) * radius;
  const y = centerY + Math.sin(angleRadians) * radius;
  
  return {
    x,
    y,
    angle,
    radius,
  };
};

/**
 * 避让逻辑 - 检查位置是否在禁区内
 * @param position 要检查的位置
 * @param avoidanceZones 避让区域数组  
 */
export const isPositionValid = (
  position: { x: number; y: number },
  avoidanceZones = GALAXY_CONFIG.avoidanceZones
): boolean => {
  return !avoidanceZones.some((zone: AvoidanceZone) => 
    position.x >= zone.x && 
    position.x <= zone.x + zone.width &&
    position.y >= zone.y && 
    position.y <= zone.y + zone.height
  );
};

/**
 * 为他者星系生成随机位置 (避开禁区和其他星系)
 * @param existingGalaxies 已存在的星系位置
 * @param screenWidth 屏幕宽度
 * @param screenHeight 屏幕高度
 * @param minDistance 最小距离
 */
export const generateRandomGalaxyPosition = (
  existingGalaxies: Array<{ x: number; y: number }> = [],
  screenWidth: number = window.innerWidth,
  screenHeight: number = window.innerHeight,
  minDistance: number = GALAXY_CONFIG.minDistance
): { x: number; y: number } => {
  let position: { x: number; y: number };
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    // 在屏幕80%区域内生成随机位置
    position = {
      x: (Math.random() - 0.5) * screenWidth * 0.8,
      y: (Math.random() - 0.5) * screenHeight * 0.8,
    };
    attempts++;
    
    // 检查是否满足所有条件
    const validPosition = isPositionValid(position) && 
      isMinimumDistanceValid(position, existingGalaxies, minDistance);
    
    if (validPosition) {
      break;
    }
  } while (attempts < maxAttempts);
  
  return position;
};

/**
 * 检查与已存在星系的最小距离
 * @param position 新位置
 * @param existingGalaxies 已存在的星系
 * @param minDistance 最小距离
 */
const isMinimumDistanceValid = (
  position: { x: number; y: number },
  existingGalaxies: Array<{ x: number; y: number }>,
  minDistance: number
): boolean => {
  return existingGalaxies.every(galaxy => {
    const distance = calculateDistance(position, galaxy);
    return distance >= minDistance;
  });
};

/**
 * 计算两点之间的距离
 */
export const calculateDistance = (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 摄像机平滑移动的缓动函数
 * @param current 当前位置
 * @param target 目标位置
 * @param speed 移动速度 (0-1)
 */
export const smoothMove = (
  current: { x: number; y: number },
  target: { x: number; y: number },
  speed: number = 0.05
): { x: number; y: number } => {
  return {
    x: current.x + (target.x - current.x) * speed,
    y: current.y + (target.y - current.y) * speed,
  };
};

/**
 * 检查摄像机是否已到达目标位置
 * @param current 当前位置
 * @param target 目标位置  
 * @param threshold 阈值
 */
export const isNearTarget = (
  current: { x: number; y: number },
  target: { x: number; y: number },
  threshold: number = 5
): boolean => {
  return calculateDistance(current, target) < threshold;
};

/**
 * 获取星系的边界框 (用于视觉调试)
 * @param particles 星系中的粒子
 * @param center 星系中心
 */
export const getGalaxyBounds = (
  particles: Array<{ x: number; y: number }>,
  center: { x: number; y: number }
) => {
  if (particles.length === 0) {
    return { 
      minX: center.x - 10, 
      maxX: center.x + 10, 
      minY: center.y - 10, 
      maxY: center.y + 10 
    };
  }
  
  const xs = particles.map(p => p.x);
  const ys = particles.map(p => p.y);
  
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};