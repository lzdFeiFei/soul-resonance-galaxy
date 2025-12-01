import { HeaderWave } from '@/components/canvas/HeaderWave';

export const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-start pb-5 border-b border-accent-line">
      {/* 左侧：LOGO 和元信息 */}
      <div className="text-left">
        <div className="font-playfair text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-sm">
          SPARKING
          <br />
          <span className="font-normal italic text-[0.9em]">SOUL</span>
        </div>
        <div className="mt-4 font-noto-serif text-xs text-text-secondary tracking-wider space-y-1">
          <div>灵感与情绪的共鸣宇宙</div>
          <div>ID: soul_visitor_{Math.floor(Math.random() * 100000)}</div>
          <div>Location: 31.2304°N, 121.4737°E</div>
        </div>
      </div>

      {/* 右侧：章节信息和声波 */}
      <div className="text-right flex flex-col items-end">
        <div className="text-text-secondary text-xs mb-3 tracking-wider uppercase">
          Chapter I: The Resonance
        </div>
        
        {/* 16根动态声波 */}
        <div className="w-32 h-10 relative">
          <HeaderWave className="absolute inset-0" />
        </div>
      </div>
    </header>
  );
};