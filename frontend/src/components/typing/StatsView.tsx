import { useRef, useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Area,
  ComposedChart
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { TypingStats } from '@/hooks/useTypingEngine';
import { 
  RotateCcw, 
  Play, 
  History, 
  Camera, 
  ArrowRight, 
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ReplayModal } from './ReplayModal';

interface StatsViewProps {
  stats: TypingStats;
  mode: string;
  text: string;
  testConfig: {
    punctuation: boolean;
    numbers: boolean;
    language?: string;
    timeLimit?: number;
    wordCount?: number;
  };
  onRestart: (type: 'next' | 'repeat' | 'practice') => void;
}

const chartConfig: ChartConfig = {
  wpm: {
    label: "WPM",
    theme: {
      light: "#8b5cf6",
      dark: "#a78bfa",
    },
  },
  rawWpm: {
    label: "Raw",
    theme: {
      light: "#94a3b8",
      dark: "#64748b",
    },
  },
  errors: {
    label: "Errors",
    color: "#ef4444",
  }
};

export function StatsView({ stats, mode, text, testConfig, onRestart }: StatsViewProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const takeScreenshot = async () => {
    if (statsRef.current === null) return;
    try {
      const dataUrl = await toPng(statsRef.current, { cacheBust: true, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = `turbo-type-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Screenshot saved!');
    } catch (err) {
      toast.error('Failed to take screenshot');
      console.error(err);
    }
  };



  return (
    <div className="w-full max-w-6xl mx-auto py-4 animate-in fade-in zoom-in duration-700">
      <div 
        ref={statsRef} 
        className="grid grid-cols-12 gap-4 items-center glass p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* WPM & ACC (Left on Desktop, Top on Mobile) */}
        <div className="col-span-12 lg:col-span-2 flex flex-row lg:flex-col justify-around lg:justify-start lg:gap-8 relative z-10 w-full mb-2 lg:mb-0">
          <div className="group transition-all hover:scale-105 text-center lg:text-left">
            <div className="text-muted-foreground/60 text-xs md:text-sm uppercase tracking-[0.2em] font-bold mb-1">wpm</div>
            <div className="text-6xl md:text-7xl font-black text-primary tracking-tighter leading-none neon-glow">
              {stats.wpm}
            </div>
          </div>
          <div className="group transition-all hover:scale-105 text-center lg:text-left">
            <div className="text-muted-foreground/60 text-xs md:text-sm uppercase tracking-[0.2em] font-bold mb-1">acc</div>
            <div className="text-6xl md:text-7xl font-black text-primary tracking-tighter leading-none neon-glow">
              {stats.accuracy}<span className="text-3xl md:text-4xl opacity-50">%</span>
            </div>
          </div>
        </div>

        {/* Center: Chart */}
        <div 
          className="col-span-12 lg:col-span-10 h-[220px] md:h-[260px] relative z-10 lg:-ml-4 select-none cursor-default"
          onMouseDownCapture={(e) => e.preventDefault()}
          onClickCapture={(e) => e.stopPropagation()}
        >
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ComposedChart data={stats.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              />
              <YAxis 
                yAxisId="wpm"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              />
              {/* Errors YAxis (Right Side) */}
              <YAxis 
                yAxisId="errors"
                orientation="right"
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'var(--color-errors)', fontSize: 10, opacity: 0.8 }}
                allowDecimals={false}
                domain={[0, 'auto']}
              />
              
              <Area 
                type="step" 
                dataKey="errors" 
                yAxisId="errors"
                stroke="transparent" 
                strokeWidth={0}
                fill="none" 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload && payload.errors > 0) {
                    return (
                      <g key={`error-dot-${payload.time}`} transform={`translate(${cx}, ${cy})`}>
                        <line x1="-5.5" y1="-5.5" x2="5.5" y2="5.5" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                        <line x1="-5.5" y1="5.5" x2="5.5" y2="-5.5" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                      </g>
                    );
                  }
                  return <circle cx={cx} cy={cy} r={0} fill="none" key={`empty-dot-${payload?.time || Math.random()}`} />;
                }}
                activeDot={{ r: 6, fill: "#ef4444", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />

              <ChartTooltip 
                content={<ChartTooltipContent className="glass border-white/10" />} 
                cursor={{ stroke: 'rgba(167, 139, 250, 0.4)', strokeWidth: 2, strokeDasharray: '4 4' }} 
              />
              
              <Area 
                type="monotone" 
                dataKey="wpm" 
                yAxisId="wpm"
                stroke="var(--color-wpm)" 
                strokeWidth={3}
                fill="url(#colorWpm)" 
                dot={false}
                activeDot={{ r: 6, fill: "var(--color-wpm)", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
              <Area 
                type="monotone" 
                dataKey="rawWpm"
                yAxisId="wpm"
                stroke="var(--color-rawWpm)" 
                strokeWidth={2}
                strokeDasharray="8 8"
                fill="none" 
                dot={false}
                opacity={0.3}
              />
              
              <defs>
                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-wpm)" stopOpacity={0.4}/>
                  <stop offset="50%" stopColor="var(--color-wpm)" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="var(--color-wpm)" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ChartContainer>
        </div>

        {/* Bottom Grid: Secondary Stats */}
        <div className="col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 md:pt-8 border-t border-white/5 relative z-10 w-full pl-2 lg:pl-0">
          <div className="text-center md:text-left group cursor-default">
            <div className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">test type</div>
            <div className="text-lg md:text-xl md:mt-1 font-black text-primary/80 leading-snug">
              {mode} {testConfig.timeLimit ? testConfig.timeLimit : testConfig.wordCount ? testConfig.wordCount : ''}
              <br />
              <span className="text-xs md:text-sm text-foreground/70">{testConfig.language || (testConfig.punctuation ? 'punctuation' : 'english')}</span>
            </div>
          </div>
          <div className="text-center md:text-left group cursor-default">
            <div className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">raw</div>
            <div className="text-3xl md:text-4xl font-black tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{stats.rawWpm}</div>
          </div>
          <div className="text-center md:text-left group cursor-default col-span-2 md:col-span-1">
            <div className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">characters</div>
            <div className="text-xl md:text-2xl font-black flex justify-center md:justify-start items-baseline gap-1 mt-1 md:mt-2">
              <span className="text-foreground/90">{stats.correctChars}</span>
              <span className="text-muted-foreground/20 text-base md:text-lg">/</span>
              <span className="text-red-500/80">{stats.incorrectChars}</span>
              <span className="text-muted-foreground/20 text-base md:text-lg">/</span>
              <span className="text-red-400/60 text-base md:text-lg">{stats.extraChars}</span>
            </div>
          </div>
          <div className="text-center md:text-left group cursor-default">
            <div className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">consistency</div>
            <div className="text-3xl md:text-4xl font-black tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{stats.consistency}%</div>
          </div>
          <div className="text-center md:text-left group cursor-default">
            <div className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">time</div>
            <div className="text-3xl md:text-4xl font-black tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{Math.round(stats.timeElapsed)}s</div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-6 glass p-4 rounded-[1.5rem] border-white/5 animate-in slide-in-from-bottom-8 duration-700 delay-300">
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5 rounded-xl px-4 md:px-6 h-10" onClick={() => onRestart('next')}>
          <ArrowRight className="h-4 w-4" />
          next test
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5 rounded-xl px-4 md:px-6 h-10" onClick={() => onRestart('repeat')}>
          <RotateCcw className="h-4 w-4" />
          repeat
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5 rounded-xl px-4 md:px-6 h-10" onClick={() => onRestart('practice')}>
          <Target className="h-4 w-4" />
          practice
        </Button>
        <div className="hidden md:block w-px h-6 bg-white/5 mx-1 my-auto" />
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5 rounded-xl px-4 md:px-6 h-10" onClick={() => setShowReplay(true)}>
          <Play className="h-4 w-4" />
          replay
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5 rounded-xl px-4 md:px-6 h-10" onClick={() => setShowHistory(!showHistory)}>
          <History className="h-4 w-4" />
          history
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5 rounded-xl px-4 md:px-6 h-10" onClick={takeScreenshot}>
          <Camera className="h-4 w-4" />
          screenshot
        </Button>
      </div>

      {/* Words History Breakdown */}
      {showHistory && (
        <div className="mt-8 p-10 glass rounded-[2rem] border-white/5 animate-in zoom-in-95 duration-500">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3 text-muted-foreground/60">
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            Keystroke Integrity
          </h3>
          <div className="flex flex-wrap gap-x-8 gap-y-4 font-mono text-xl leading-relaxed">
            {stats.wordResults.map((word, i) => (
              <span 
                key={i} 
                className={cn(
                  "transition-all duration-300",
                  word.isCorrect ? "text-foreground/70" : "text-red-500/80 underline underline-offset-8 decoration-dashed opacity-100"
                )}
              >
                {word.word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Replay Modal */}
      <ReplayModal 
        open={showReplay} 
        onClose={() => setShowReplay(false)} 
        keystrokes={stats.keystrokes} 
        text={text}
      />
    </div>
  );
}
