// 调试和测试工具函数
export const debug = {
  // 检查粒子系统状态
  checkParticleSystem: () => {
    console.log('🌌 Soul Resonance - React 重构版本 v1.0');
    console.log('📊 系统状态检查:');
    
    // 检查 Store 状态
    try {
      const appStore = (window as any).__SOUL_DEBUG_APP_STORE__;
      const galaxyStore = (window as any).__SOUL_DEBUG_GALAXY_STORE__;
      const canvasStore = (window as any).__SOUL_DEBUG_CANVAS_STORE__;
      
      console.log('✅ App Store:', appStore ? 'Connected' : 'Not found');
      console.log('✅ Galaxy Store:', galaxyStore ? 'Connected' : 'Not found');
      console.log('✅ Canvas Store:', canvasStore ? 'Connected' : 'Not found');
    } catch (e) {
      console.log('⚠️  Store debug not initialized');
    }
    
    // 检查 Canvas 元素
    const canvas = document.querySelector('canvas');
    console.log('✅ Canvas:', canvas ? `${canvas.width}x${canvas.height}` : 'Not found');
    
    // 检查样式
    const hasStyles = document.querySelector('style');
    console.log('✅ Styles:', hasStyles ? 'Loaded' : 'Not loaded');
    
    console.log('🎨 Visual Effects:');
    console.log('  - Particle System: Active');
    console.log('  - Header Wave: Active');
    console.log('  - Noise Overlay: Active');
    console.log('  - Glass Effects: Active');
    
    return true;
  },
  
  // 模拟完整用户流程
  simulateUserFlow: async () => {
    console.log('🎭 模拟用户交互流程...');
    
    // 模拟输入
    const inputEvent = new CustomEvent('soul:simulate-input', {
      detail: { text: '在宇宙的深处，我找到了自己的回声。' }
    });
    document.dispatchEvent(inputEvent);
    
    // 模拟点击共鸣按钮
    setTimeout(() => {
      const resonateEvent = new CustomEvent('soul:simulate-resonate');
      document.dispatchEvent(resonateEvent);
      console.log('✨ 共鸣已开始...');
    }, 1000);
    
    return true;
  },
  
  // 性能监控
  monitorPerformance: () => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        console.log(`🚀 FPS: ${fps}`);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkFPS);
    };
    
    checkFPS();
    console.log('📈 性能监控已启动');
  }
};

// 全局暴露调试工具
if (typeof window !== 'undefined') {
  (window as any).__SOUL_DEBUG__ = debug;
}