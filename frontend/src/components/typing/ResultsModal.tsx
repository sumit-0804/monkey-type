import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TypingStats } from '@/hooks/useTypingEngine';
import { Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface ResultsModalProps {
  open: boolean;
  stats: TypingStats;
  mode: 'time' | 'words' | 'code';
  testConfig: {
    punctuation: boolean;
    numbers: boolean;
    language?: string;
    timeLimit?: number;
    wordCount?: number;
  };
  onClose: () => void;
  onReset: () => void;
}

export interface TestResult {
  id: string;
  name: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  date: string;
  mode: string;
  testType: string;
  config: string;
}

export function ResultsModal({ open, stats, mode, testConfig, onClose, onReset }: ResultsModalProps) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open && stats.wpm > 0) {
      // Trigger confetti for good performance
      if (stats.wpm >= 60) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Load saved name from localStorage
      const savedName = localStorage.getItem('turbo-type-username');
      if (savedName) {
        setName(savedName);
      }
    }
  }, [open, stats.wpm]);

  const getConfigString = () => {
    const parts = [];
    if (mode === 'code' && testConfig.language) {
      parts.push(testConfig.language);
    } else {
      if (testConfig.punctuation) parts.push('punctuation');
      if (testConfig.numbers) parts.push('numbers');
      if (testConfig.timeLimit) parts.push(`${testConfig.timeLimit}s`);
      if (testConfig.wordCount) parts.push(`${testConfig.wordCount} words`);
    }
    return parts.join(' • ');
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // Save username
    localStorage.setItem('turbo-type-username', name);

    // Save result to leaderboard
    const results: TestResult[] = JSON.parse(localStorage.getItem('turbo-type-results') || '[]');
    const newResult: TestResult = {
      id: Date.now().toString(),
      name: name.trim(),
      wpm: stats.wpm,
      rawWpm: stats.rawWpm,
      accuracy: stats.accuracy,
      date: new Date().toISOString(),
      mode: mode === 'code' ? 'code' : 'typing',
      testType: mode,
      config: getConfigString(),
    };

    results.push(newResult);
    // Keep only top 100 results
    results.sort((a, b) => b.wpm - a.wpm);
    const top100 = results.slice(0, 100);
    localStorage.setItem('turbo-type-results', JSON.stringify(top100));

    setSaved(true);
    toast.success('Result saved to leaderboard!');
  };

  const handleNextTest = () => {
    setSaved(false);
    onClose();
    onReset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-primary" />
            Test Complete!
          </DialogTitle>
          <DialogDescription>
            {getConfigString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
              <div className="text-sm text-muted-foreground mb-2">WPM</div>
              <div className="text-5xl font-bold text-primary">{stats.wpm}</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
              <div className="text-sm text-muted-foreground mb-2">Accuracy</div>
              <div className="text-5xl font-bold text-primary">{stats.accuracy}%</div>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Raw WPM</div>
              <div className="text-2xl font-bold">{stats.rawWpm}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Time</div>
              <div className="text-2xl font-bold">{stats.timeElapsed.toFixed(1)}s</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Characters</div>
              <div className="text-2xl font-bold">{stats.correctChars}/{stats.totalChars}</div>
            </div>
          </div>

          {/* Detailed stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Correct characters:</span>
              <span className="font-semibold text-green-500">{stats.correctChars}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Incorrect:</span>
              <span className="font-semibold text-red-500">{stats.incorrectChars}</span>
            </div>
          </div>

          {/* Save to leaderboard */}
          {!saved && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label htmlFor="result-name" className="text-sm font-medium">Save to Leaderboard</label>
              <div className="flex gap-2">
                <Input
                  id="result-name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          )}

          {saved && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-center">
              ✓ Saved to leaderboard!
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleNextTest} className="flex-1 gap-2" size="lg">
              <RotateCcw className="h-4 w-4" />
              Next Test
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
