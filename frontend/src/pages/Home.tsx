import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTypingEngine, type TypingStats } from '@/hooks/useTypingEngine';
import { TypingArea } from '@/components/typing/TypingArea';
import { StatsView } from '@/components/typing/StatsView';
import { ConfigPanel, type ConfigMode, type TestType } from '@/components/typing/ConfigPanel';
import { TimerDisplay } from '@/components/typing/TimerDisplay';
import { generateText, getCodeSnippet, type CodeLanguage } from '@/lib/textSamples';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';

export default function Home() {
  const [configMode, setConfigMode] = useState<ConfigMode>('normal');
  const [testType, setTestType] = useState<TestType>('time');
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [wordCount, setWordCount] = useState(50);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('javascript');
  const [currentText, setCurrentText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const generateNewText = useCallback(() => {
    if (configMode === 'code') {
      setCurrentText(getCodeSnippet(codeLanguage));
    } else {
      setCurrentText(generateText(wordCount, punctuation, numbers));
    }
  }, [configMode, codeLanguage, wordCount, punctuation, numbers]);

  // Initial text generation
  useEffect(() => {
    if (!currentText) generateNewText();
  }, [generateNewText, currentText]);

  const handleComplete = useCallback(async (stats: TypingStats) => {
    setFinalStats(stats);
    setShowStats(true);

    if (isAuthenticated) {
      try {
        await api.post('/results', {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          mode: configMode === 'code' ? 'code' : testType,
          language: configMode === 'code' ? codeLanguage : undefined,
          timeElapsed: Math.floor(stats.timeElapsed),
        });
      } catch (error) {
        console.error('Failed to save test result:', error);
      }
    }
  }, [isAuthenticated, configMode, testType, codeLanguage]);

  const engineProps = useMemo(() => ({
    text: currentText,
    mode: configMode === 'code' && testType === 'words' ? 'words' : testType,
    timeLimit: testType === 'time' ? timeLimit : undefined,
    onComplete: handleComplete,
  }), [currentText, configMode, testType, timeLimit, handleComplete]);

  const {
    typed,
    cursor,
    status,
    characterStates,
    currentTime,
    inputRef,
    handleInput,
    reset,
  } = useTypingEngine(engineProps);

  const handleRestart = (type: 'next' | 'repeat' | 'practice') => {
    if (type === 'next') {
      generateNewText();
    } else if (type === 'practice' && finalStats) {
      const missed = finalStats.wordResults
        .filter(w => !w.isCorrect)
        .map(w => w.word);
      
      if (missed.length > 0) {
        // Repeat missed words until we have enough to fill a test or just the missed ones
        let practiceText = missed.join(' ');
        while (practiceText.split(' ').length < 10 && missed.length > 0) {
          practiceText += ' ' + missed.join(' ');
        }
        setCurrentText(practiceText);
      } else {
        generateNewText();
      }
    }
    // 'repeat' maintains currentText
    
    reset();
    setShowStats(false);
    setFinalStats(null);
  };

  const handleConfigChange = () => {
    generateNewText();
    reset();
    setShowStats(false);
    setFinalStats(null);
  };

  useEffect(() => {
    handleConfigChange();
  }, [configMode, testType, punctuation, numbers, timeLimit, wordCount, codeLanguage]);

  // Keyboard shortcut for reset (Shift+Tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        handleRestart('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (showStats && finalStats) {
    return (
      <StatsView 
        stats={finalStats}
        text={currentText}
        mode={configMode === 'code' ? 'code' : testType}
        testConfig={{
          punctuation,
          numbers,
          language: configMode === 'code' ? codeLanguage : undefined,
          timeLimit: testType === 'time' ? timeLimit : undefined,
          wordCount: testType === 'words' ? wordCount : undefined,
        }}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-200px)] flex flex-col pt-0">
      <div className={cn(
        "transition-opacity duration-300 w-full flex flex-col",
        status === 'running' ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <ConfigPanel
          mode={configMode}
          onModeChange={setConfigMode}
          testType={testType}
          onTestTypeChange={setTestType}
          punctuation={punctuation}
          onPunctuationChange={setPunctuation}
          numbers={numbers}
          onNumbersChange={setNumbers}
          timeLimit={timeLimit}
          onTimeLimitChange={setTimeLimit}
          wordCount={wordCount}
          onWordCountChange={setWordCount}
          codeLanguage={codeLanguage}
          onCodeLanguageChange={setCodeLanguage}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-8">
        <div className={cn(
          "transition-opacity duration-300 w-full flex flex-col items-center",
          status === 'running' ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <TimerDisplay
            timeElapsed={currentTime}
            timeLimit={testType === 'time' ? timeLimit : undefined}
            mode={testType}
            status={status}
          />
        </div>

        <TypingArea
          characterStates={characterStates}
          cursor={cursor}
          typed={typed}
          inputRef={inputRef}
          onInput={handleInput}
          isCodeMode={configMode === 'code'}
          status={status}
        />

        {status !== 'finished' && (
          <div className={cn(
            "mt-12 flex flex-col items-center gap-4 transition-opacity duration-300",
            status === 'running' ? "opacity-0" : "opacity-100"
          )}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRestart('next')}
              className="gap-2 rounded-full px-8"
            >
              <RotateCcw className="h-4 w-4" />
              restart test
            </Button>
            <span className="text-xs text-muted-foreground/50 font-mono">
              shift + tab to quickly restart
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to keep the layout clean
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
