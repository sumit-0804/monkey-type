import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { KeystrokeLog } from '@/hooks/useTypingEngine';
import { cn } from '@/lib/utils';

interface ReplayModalProps {
  open: boolean;
  onClose: () => void;
  keystrokes: KeystrokeLog[];
  text: string;
}

export function ReplayModal({ open, onClose, keystrokes, text }: ReplayModalProps) {
  const [playbackIdx, setPlaybackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [displayTyped, setDisplayTyped] = useState('');
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setPlaybackIdx(0);
      setDisplayTyped('');
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [open]);

  useEffect(() => {
    if (isPlaying && playbackIdx < keystrokes.length) {
      const current = keystrokes[playbackIdx];
      const next = keystrokes[playbackIdx + 1];
      
      const delay = next 
        ? (next.timestamp - current.timestamp) / speed 
        : 500;

      timerRef.current = setTimeout(() => {
        if (current.char === 'Backspace') {
          setDisplayTyped(prev => prev.slice(0, -1));
        } else {
          setDisplayTyped(prev => prev + current.char);
        }
        setPlaybackIdx(prev => prev + 1);
      }, delay);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (playbackIdx >= keystrokes.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, playbackIdx, keystrokes, speed]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const restart = () => {
    setPlaybackIdx(0);
    setDisplayTyped('');
    setIsPlaying(true);
  };

  const characterStates = text.split('').map((char, index) => {
    if (index < displayTyped.length) {
      return {
        char,
        status: displayTyped[index] === char ? 'correct' : 'incorrect',
      };
    }
    return { char, status: 'pending' };
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Play className="h-6 w-6 text-primary" />
            Watch Replay
          </DialogTitle>
        </DialogHeader>

        <div className="py-12 px-6 flex items-center justify-center min-h-[300px] text-3xl font-mono leading-relaxed select-none bg-muted/20 rounded-xl relative">
          <div className="whitespace-pre-wrap break-words max-w-2xl text-center">
            {characterStates.map((cs, idx) => (
              <span 
                key={idx} 
                className={cn(
                  "transition-colors",
                  cs.status === 'correct' && "text-foreground",
                  cs.status === 'incorrect' && "text-red-500",
                  cs.status === 'pending' && "text-muted-foreground/30",
                  idx === displayTyped.length && "typing-cursor"
                )}
              >
                {cs.char === ' ' ? '\u00A0' : cs.char}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 bg-secondary/50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={restart}>
              <RotateCcw className="h-5 w-5" />
            </Button>
            <div className="text-sm font-medium px-2">
              {playbackIdx} / {keystrokes.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[1, 1.5, 2, 4].map(s => (
              <Button 
                key={s} 
                variant={speed === s ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setSpeed(s)}
                className="w-10"
              >
                {s}x
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
