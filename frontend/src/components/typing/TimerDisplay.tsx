interface TimerDisplayProps {
  timeElapsed: number;
  timeLimit?: number;
  mode: 'time' | 'words';
  status: 'idle' | 'running' | 'finished';
}

export function TimerDisplay({ timeElapsed, timeLimit, mode, status }: TimerDisplayProps) {
  if (status === 'idle' || status === 'finished') {
    return null;
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return seconds;
  };

  if (mode === 'time' && timeLimit) {
    const remaining = Math.max(0, timeLimit - formatTime(timeElapsed));
    return (
      <div className="text-center mb-4">
        <div className="text-4xl font-mono text-primary">
          {remaining}
        </div>
      </div>
    );
  }

  if (mode === 'words') {
    return (
      <div className="text-center mb-4">
        <div className="text-2xl font-mono text-muted-foreground">
          {formatTime(timeElapsed)}s
        </div>
      </div>
    );
  }

  return null;
}
