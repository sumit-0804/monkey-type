import { useState, useEffect, useCallback, useRef } from 'react';

export type TypingStatus = 'idle' | 'running' | 'finished';

export interface CharacterState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'extra';
}

export interface WpmDataPoint {
  time: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface KeystrokeLog {
  timestamp: number;
  char: string;
  expected: string;
  status: 'correct' | 'incorrect' | 'backspace' | 'extra';
}

export interface WordResult {
  word: string;
  isCorrect: boolean;
  isSlow: boolean;
  wpm: number;
}

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalChars: number;
  timeElapsed: number;
  consistency: number;
  chartData: WpmDataPoint[];
  keystrokes: KeystrokeLog[];
  wordResults: WordResult[];
}

interface UseTypingEngineProps {
  text: string;
  mode: 'time' | 'words';
  timeLimit?: number; // in seconds
  onComplete: (stats: TypingStats) => void;
  isCodeMode?: boolean;
}

export function useTypingEngine({ text, mode, timeLimit, onComplete, isCodeMode = false }: UseTypingEngineProps) {
  const [typed, setTyped] = useState<string>('');
  const [status, setStatus] = useState<TypingStatus>('idle');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTimeState, setCurrentTimeState] = useState<number>(0);
  
  // Data tracking
  const [chartData, setChartData] = useState<WpmDataPoint[]>([]);
  const [keystrokes, setKeystrokes] = useState<KeystrokeLog[]>([]);
  const errorCountRef = useRef(0);
  const typedRef = useRef('');
  const textRef = useRef(text);
  const chartDataRef = useRef<WpmDataPoint[]>([]);
  const lastSecondRef = useRef(0);
  const keystrokesRef = useRef<KeystrokeLog[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync refs
  useEffect(() => { typedRef.current = typed; }, [typed]);
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { chartDataRef.current = chartData; }, [chartData]);
  useEffect(() => { keystrokesRef.current = keystrokes; }, [keystrokes]);

  // Character states calculation
  const characterStates: CharacterState[] = text.split('').map((char, index) => {
    if (index < typed.length) {
      return {
        char,
        status: typed[index] === char ? 'correct' : 'incorrect',
      };
    }
    return {
      char,
      status: 'pending',
    };
  });

  for (let i = text.length; i < typed.length; i++) {
    characterStates.push({
      char: typed[i],
      status: 'extra',
    });
  }

  // Helper to calculate momentary stats (internal use)
  const calculateResultStats = useCallback((currentTyped: string, currentTotalTime: number, currentChartData: WpmDataPoint[], currentKeystrokes: KeystrokeLog[]): TypingStats => {
    const currentText = textRef.current;
    // For WPM calculation, we only count CORRECT non-whitespace characters or similar logic
    // Actually standard WPM is (correct chars / 5) / minutes
    const finalCorrectChars = currentTyped.split('').filter((char, idx) => idx < currentText.length && char === currentText[idx]).length;
    const missedChars = Math.max(0, currentText.length - currentTyped.length);

    const correctKeystrokes = currentKeystrokes.filter(k => k.status === 'correct').length;
    const incorrectKeystrokes = currentKeystrokes.filter(k => k.status === 'incorrect').length;
    const extraKeystrokes = currentKeystrokes.filter(k => k.status === 'extra').length;
    const totalKeystrokes = correctKeystrokes + incorrectKeystrokes + extraKeystrokes;

    const timeInMinutes = (currentTotalTime / 1000) / 60;
    const wpm = timeInMinutes > 0 ? Math.round((finalCorrectChars / 5) / timeInMinutes) : 0;
    const rawWpm = timeInMinutes > 0 ? Math.round((totalKeystrokes / 5) / timeInMinutes) : 0;
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

    // Consistency calculation
    let consistency = 100;
    if (currentChartData.length > 1) {
      const wpms = currentChartData.map(d => d.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = mean > 0 ? Math.max(0, Math.round(100 * (1 - (stdDev / mean)))) : 100;
    }

    // Word analysis
    const originalWords = currentText.split(/\s+/);
    const typedWords = currentTyped.split(/\s+/);
    const wordResults: WordResult[] = originalWords.map((word, i) => {
      const typedWord = typedWords[i] || '';
      return {
        word,
        isCorrect: typedWord === word,
        isSlow: false,
        wpm: 0
      };
    });

    return {
      wpm,
      rawWpm,
      accuracy,
      correctChars: correctKeystrokes,
      incorrectChars: incorrectKeystrokes,
      extraChars: extraKeystrokes,
      missedChars,
      totalChars: totalKeystrokes,
      timeElapsed: currentTotalTime / 1000,
      consistency,
      chartData: currentChartData,
      keystrokes: currentKeystrokes,
      wordResults
    };
  }, []);

  const completeTest = useCallback(() => {
    const now = Date.now();
    setStatus('finished');
    if (timerRef.current) clearInterval(timerRef.current);

    const finalTime = now - (startTime || now);
    // Use latest refs for final stats
    onComplete(calculateResultStats(typedRef.current, finalTime, chartDataRef.current, keystrokesRef.current));
  }, [startTime, onComplete, calculateResultStats]);

  // Main Timer Loop (runs once per test session)
  useEffect(() => {
    if (status === 'running' && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const second = Math.floor(elapsed / 1000);
        
        setCurrentTimeState(elapsed);

        // Record chart data every second
        if (second > lastSecondRef.current) {
          const currentStats = calculateResultStats(typedRef.current, elapsed, chartDataRef.current, keystrokesRef.current);
          
          const startMs = lastSecondRef.current * 1000;
          const endMs = second * 1000;
          const errorsInSecond = keystrokesRef.current.filter(k => 
            k.status === 'incorrect' && 
            k.timestamp >= startMs && 
            k.timestamp < endMs
          ).length;

          setChartData(prev => {
            const newData = [...prev, {
              time: second,
              wpm: currentStats.wpm,
              rawWpm: currentStats.rawWpm,
              errors: errorsInSecond
            }];
            return newData;
          });
          lastSecondRef.current = second;
        }

        // Check time limit
        if (mode === 'time' && timeLimit && elapsed >= timeLimit * 1000) {
          completeTest();
        }
      }, 100);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [status, startTime, mode, timeLimit, completeTest, calculateResultStats]);

  const handleInput = useCallback((value: string) => {
    if (status === 'finished') return;

    const now = Date.now();
    if (status === 'idle' && value.length > 0) {
      setStatus('running');
      setStartTime(now);
      lastSecondRef.current = 0;
      // Add initial data point
      setChartData([{ time: 0, wpm: 0, rawWpm: 0, errors: 0 }]);
    }

    // Record keystroke
    const prevTyped = typedRef.current;
    const isBackspace = value.length < prevTyped.length;
    let newValue = value;
    
    // Auto-indent logic for code mode
    if (isCodeMode && !isBackspace && value[value.length - 1] === '\n') {
      let nextIndex = value.length;
      let extraSpaces = "";
      while (nextIndex < textRef.current.length && textRef.current[nextIndex] === ' ') {
        extraSpaces += ' ';
        nextIndex++;
      }
      if (extraSpaces) {
        newValue = value + extraSpaces;
      }
    }

    const charTyped = isBackspace ? 'Backspace' : value[value.length - 1];
    const expected = textRef.current[value.length - 1] || '';
    
    let status_type: KeystrokeLog['status'];
    if (isBackspace) {
      status_type = 'backspace';
    } else if (expected === '') {
      status_type = 'extra';
    } else if (charTyped === expected) {
      status_type = 'correct';
    } else {
      status_type = 'incorrect';
    }
    
    if (status_type === 'incorrect' || status_type === 'extra') errorCountRef.current += 1;

    const newKeystroke: KeystrokeLog = {
      timestamp: now - (startTime || now),
      char: charTyped,
      expected,
      status: status_type as any
    };
    
    setKeystrokes(prev => [...prev, newKeystroke]);
    keystrokesRef.current.push(newKeystroke);

    setTyped(newValue);

    // Words mode completion
    if (mode === 'words' && newValue.length >= textRef.current.length && newValue === textRef.current) {
      completeTest();
    }
  }, [status, mode, startTime, completeTest, isCodeMode]);

  const reset = useCallback(() => {
    setTyped('');
    typedRef.current = '';
    setStatus('idle');
    setStartTime(null);
    setCurrentTimeState(0);
    setChartData([]);
    chartDataRef.current = [];
    setKeystrokes([]);
    keystrokesRef.current = [];
    errorCountRef.current = 0;
    lastSecondRef.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    const handleClick = () => status !== 'finished' && inputRef.current?.focus();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [status]);

  return {
    typed,
    cursor: typed.length,
    status,
    stats: calculateResultStats(typed, currentTimeState, chartData, keystrokes),
    characterStates,
    currentTime: currentTimeState,
    inputRef,
    handleInput,
    reset,
  };
}
