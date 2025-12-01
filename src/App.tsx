import { useAppStore } from '@/stores';
import { SimpleParticleCanvas } from '@/components/canvas/SimpleParticleCanvas';
import { NoiseOverlay } from '@/components/layout/NoiseOverlay';
import { Header } from '@/components/layout/Header';
import { InputStage } from '@/components/stages/InputStage';
import { LoadingStage } from '@/components/stages/LoadingStage';
import { ResultStage } from '@/components/stages/ResultStage';
import { GalaxyStage } from '@/components/stages/GalaxyStage';
import { debug } from '@/utils/debugging';
import { testUtils } from '@/utils/testUtils';

// 在开发环境下启用调试工具
if (import.meta.env.DEV) {
  setTimeout(() => {
    debug.checkParticleSystem();
    debug.monitorPerformance();
    console.log('🌌 星系测试工具已加载:');
    console.log('  - __SOUL_TEST__.quickTestGalaxy() // 快速测试星系视图');
    console.log('  - __SOUL_TEST__.addTestParticle() // 添加测试粒子'); 
    console.log('  - __SOUL_TEST__.generateTestParticles(5) // 生成多个粒子');
  }, 1000);
}

function App() {
  const { stage } = useAppStore();

  return (
    <div className="min-h-screen bg-bg-space text-text-primary overflow-hidden">
      {/* Canvas 层 - 在星系视图时隐藏 */}
      {stage !== 'galaxy_view' && <SimpleParticleCanvas />}
      
      {/* 噪声纹理层 */}
      <NoiseOverlay />

      {/* 主内容区 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 容器：带径向渐变遮罩 */}
        <div 
          className={`flex-1 flex flex-col ${stage === 'galaxy_view' ? '' : 'justify-between p-10'}`}
          style={stage === 'galaxy_view' ? {} : {
            background: 'radial-gradient(circle at center, transparent 0%, rgba(5, 6, 5, 0.5) 100%)',
          }}
        >
          {/* Header - 星系视图时隐藏 */}
          {stage !== 'galaxy_view' && <Header />}

          {/* 主交互区域 */}
          <div className={`flex-1 flex items-center justify-center relative ${stage === 'galaxy_view' ? 'h-full' : ''}`}>
            {/* 阶段容器 */}
            <div className="relative w-full">
              {/* 输入阶段 */}
              <div className={`
                absolute inset-0 transition-all duration-800 ease-in-out
                ${stage === 'input' 
                  ? 'opacity-100 pointer-events-auto translate-y-0' 
                  : 'opacity-0 pointer-events-none translate-y-5'
                }
              `}>
                <InputStage />
              </div>

              {/* 加载阶段 */}
              <div className={`
                absolute inset-0 transition-all duration-800 ease-in-out
                ${stage === 'loading' 
                  ? 'opacity-100 pointer-events-auto translate-y-0' 
                  : 'opacity-0 pointer-events-none translate-y-5'
                }
              `}>
                <LoadingStage />
              </div>

              {/* 结果阶段 */}
              <div className={`
                absolute inset-0 transition-all duration-800 ease-in-out
                ${stage === 'result' 
                  ? 'opacity-100 pointer-events-auto translate-y-0' 
                  : 'opacity-0 pointer-events-none translate-y-5'
                }
              `}>
                <ResultStage />
              </div>

              {/* 星系视图 */}
              <div className={`
                ${stage === 'galaxy_view' ? 'fixed inset-0' : 'absolute inset-0'} 
                transition-all duration-800 ease-in-out
                ${stage === 'galaxy_view' 
                  ? 'opacity-100 pointer-events-auto translate-y-0' 
                  : 'opacity-0 pointer-events-none translate-y-5'
                }
              `}>
                <GalaxyStage />
              </div>
            </div>
          </div>

          {/* Footer 区域 (可选) */}
          <div className="text-center text-text-secondary text-xs">
            <p>按 ESC 随时返回输入界面</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;