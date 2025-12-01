import type { Particle, FlowField, ParticleColor } from '@/types/particles';
import { PARTICLE_CONFIG } from './constants';

/**
 * 流场 (Flow Field) 算法 - 基于伪噪声函数
 * 这是项目的视觉核心，必须完美还原原版的自然流动效果
 */
export class ParticlePhysics {
  private flowField: FlowField;
  private time: number = 0;
  
  constructor(width: number, height: number, resolution: number = 20) {
    this.flowField = this.createFlowField(width, height, resolution);
  }

  /**
   * 创建流场网格
   */
  private createFlowField(width: number, height: number, resolution: number): FlowField {
    const cols = Math.ceil(width / resolution);
    const rows = Math.ceil(height / resolution);
    const vectors: Array<{ angle: number; magnitude: number }> = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const angle = this.calculateFlowAngle(x * resolution, y * resolution, this.time);
        vectors.push({
          angle,
          magnitude: PARTICLE_CONFIG.flowField.noise.strength,
        });
      }
    }

    return {
      width: cols,
      height: rows,
      resolution,
      vectors,
    };
  }

  /**
   * 伪噪声函数 - 基于 sin/cos 组合产生自然流动
   * 这是原版的核心算法，必须保持一致
   */
  private calculateFlowAngle(x: number, y: number, time: number): number {
    const scale = PARTICLE_CONFIG.flowField.noise.scale;
    const speed = PARTICLE_CONFIG.flowField.noise.speed;
    
    // 多层噪声叠加，创造复杂的漩涡效果
    const noise1 = Math.sin(x * scale + time * speed) * Math.cos(y * scale + time * speed);
    const noise2 = Math.sin(x * scale * 2 + time * speed * 1.5) * Math.cos(y * scale * 2 + time * speed * 1.5);
    const noise3 = Math.sin(x * scale * 0.5 + time * speed * 0.8) * Math.cos(y * scale * 0.5 + time * speed * 0.8);
    
    // 组合噪声，产生自然的流场方向
    const combinedNoise = (noise1 * 0.6) + (noise2 * 0.3) + (noise3 * 0.1);
    
    return combinedNoise * Math.PI * 2; // 转换为角度
  }

  /**
   * 更新流场 (每帧调用)
   */
  updateFlowField(width: number, height: number): void {
    this.time += PARTICLE_CONFIG.flowField.noise.speed;
    this.flowField = this.createFlowField(width, height, this.flowField.resolution);
  }

  /**
   * 获取指定位置的流场力
   */
  getFlowForce(x: number, y: number): { x: number; y: number } {
    const col = Math.floor(x / this.flowField.resolution);
    const row = Math.floor(y / this.flowField.resolution);
    const index = row * this.flowField.width + col;
    
    if (index < 0 || index >= this.flowField.vectors.length) {
      return { x: 0, y: 0 };
    }

    const vector = this.flowField.vectors[index];
    return {
      x: Math.cos(vector.angle) * vector.magnitude,
      y: Math.sin(vector.angle) * vector.magnitude,
    };
  }

  /**
   * 更新单个粒子的位置和速度
   */
  updateParticle(
    particle: Particle, 
    mouseX: number | null, 
    mouseY: number | null,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    // 1. 流场影响
    const flowForce = this.getFlowForce(particle.x, particle.y);
    particle.vx += flowForce.x * 0.1;
    particle.vy += flowForce.y * 0.1;

    // 2. 鼠标影响 (180px 范围内)
    if (mouseX !== null && mouseY !== null) {
      const dx = mouseX - particle.x;
      const dy = mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < PARTICLE_CONFIG.mouseDistance && distance > 0) {
        const force = (PARTICLE_CONFIG.mouseDistance - distance) / PARTICLE_CONFIG.mouseDistance;
        const angle = Math.atan2(dy, dx);
        
        // 鼠标吸引力
        particle.vx += Math.cos(angle) * force * 0.2;
        particle.vy += Math.sin(angle) * force * 0.2;
      }
    }

    // 3. 应用阻尼
    particle.vx *= 0.99;
    particle.vy *= 0.99;

    // 4. 更新位置
    particle.x += particle.vx;
    particle.y += particle.vy;

    // 5. 边界处理 (环形包围)
    if (particle.x < 0) particle.x = canvasWidth;
    if (particle.x > canvasWidth) particle.x = 0;
    if (particle.y < 0) particle.y = canvasHeight;
    if (particle.y > canvasHeight) particle.y = 0;

    // 6. 透明度动画 (基于速度)
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    particle.alpha = Math.min(0.8, Math.max(0.2, speed * 20));
  }

  /**
   * 创建初始粒子
   */
  static createParticle(
    x: number, 
    y: number, 
    id: string, 
    color: ParticleColor
  ): Particle {
    return {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.3,
    };
  }

  /**
   * 创建粒子系统
   */
  static createParticleSystem(canvasWidth: number, canvasHeight: number): Particle[] {
    const particles: Particle[] = [];
    
    for (let i = 0; i < PARTICLE_CONFIG.particleCount; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      const colorIndex = Math.floor(Math.random() * PARTICLE_CONFIG.colors.length);
      const color = PARTICLE_CONFIG.colors[colorIndex];
      
      particles.push(
        ParticlePhysics.createParticle(x, y, `particle_${i}`, color)
      );
    }
    
    return particles;
  }
}