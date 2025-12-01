// 开发测试工具
export const testUtils = {
  // 快速切换到星系视图进行测试
  quickTestGalaxy: async () => {
    const { useAppStore } = await import('../stores/appStore');
    useAppStore.getState().setStage('galaxy_view');
  },
  
  // 添加测试粒子到用户星系
  addTestParticle: async () => {
    const { useGalaxyStore } = await import('../stores/galaxyStore');
    const galaxyStore = useGalaxyStore.getState();
    
    const testParticle = {
      id: `test_particle_${Date.now()}`,
      text: `测试灵感 ${Math.floor(Math.random() * 100)}`,
      aiResponse: {
        type: 'poem' as const,
        content: '这是一个测试粒子\n用来验证星系布局',
        metadata: { 
          emotion: 'test', 
          frequency: '432Hz', 
          timestamp: Date.now() 
        }
      },
      position: { x: 0, y: 0 },
      timestamp: Date.now(),
      color: { r: 210, g: 190, b: 160 },
    };
    
    galaxyStore.addUserParticle(testParticle);
  },
  
  // 生成多个测试粒子
  generateTestParticles: async (count: number = 5) => {
    for (let i = 0; i < count; i++) {
      await testUtils.addTestParticle();
      // 稍微延迟，避免时间戳重复
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
};

// 开发环境下全局暴露
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).__SOUL_TEST__ = testUtils;
}