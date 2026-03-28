import { useEffect, useRef, useState, useMemo } from 'react';
import type { CharacterState, TypingStatus } from '@/hooks/useTypingEngine';
import { cn } from '@/lib/utils';

interface TypingAreaProps {
  characterStates: CharacterState[];
  cursor: number;
  typed: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInput: (value: string) => void;
  isCodeMode?: boolean;
  status: TypingStatus;
}

export function TypingArea({
  characterStates,
  cursor,
  typed,
  inputRef,
  onInput,
  isCodeMode = false,
  status,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [lineHeight, setLineHeight] = useState(64); // Default fallback

  const showCursor = status !== 'finished';
  const isTyping = status === 'running';

  // Group characters into words for better wrapping
  const words: { chars: CharacterState[]; startIndex: number }[] = useMemo(() => {
    const result: { chars: CharacterState[]; startIndex: number }[] = [];
    let currentWord: CharacterState[] = [];
    let startIndex = 0;

    characterStates.forEach((cs, idx) => {
      currentWord.push(cs);
      if (cs.char === ' ') {
        result.push({ chars: currentWord, startIndex: startIndex });
        currentWord = [];
        startIndex = idx + 1;
      }
    });
    if (currentWord.length > 0) {
      result.push({ chars: currentWord, startIndex: startIndex });
    }
    return result;
  }, [characterStates]);

  useEffect(() => {
    // Detect actual line height once words are rendered
    if (wordsRef.current[0]) {
      const height = wordsRef.current[0].offsetHeight;
      if (height > 0) setLineHeight(height + 16); // height + gap (16px from gap-y-4)
    }
  }, [words]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCodeMode && e.key === 'Tab') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCodeMode]);

  // Handle scrolling logic
  useEffect(() => {
    if (status === 'idle') {
      setLineIndex(0);
      return;
    }

    // Find current word under cursor
    let currentWordIdx = 0;
    for (let i = 0; i < words.length; i++) {
        const wordEnd = words[i].startIndex + words[i].chars.length;
        if (cursor >= words[i].startIndex && cursor < wordEnd) {
            currentWordIdx = i;
            break;
        }
    }
    // Edge case for end of text
    if (cursor >= characterStates.length) {
        currentWordIdx = words.length - 1;
    }

    const currentWordEl = wordsRef.current[currentWordIdx];
    const containerEl = containerRef.current;

    if (currentWordEl && containerEl) {
        const wordTop = currentWordEl.offsetTop;
        const containerTop = containerEl.offsetTop;
        const relativeTop = wordTop - containerTop;
        
        // Calculate current line based on measured lineHeight
        const currentLine = Math.floor(relativeTop / lineHeight);
        
        if (currentLine !== lineIndex) {
            setLineIndex(currentLine);
        }
    }
  }, [cursor, words, status, lineIndex, lineHeight, characterStates.length]);

  const renderCharacter = (charState: CharacterState, globalIndex: number) => {
    const isActive = globalIndex === cursor && showCursor;
    const char = charState.char === ' ' ? '\u00A0' : charState.char;
    const isSpace = charState.char === ' ';

    return (
      <span
        key={globalIndex}
        className={cn(
          'relative transition-all duration-150 ease-out inline-block',
          isActive && 'typing-cursor after:shadow-[0_0_8px_var(--primary)]',
          charState.status === 'correct' && 'text-foreground neon-glow',
          charState.status === 'incorrect' && 'text-red-500 bg-red-500/10 rounded-sm',
          charState.status === 'extra' && 'text-red-400 opacity-80',
          charState.status === 'pending' && 'text-muted-foreground/30',
          isSpace && charState.status === 'incorrect' && 'bg-red-500/40 rounded-sm mx-0.5',
        )}
      >
        {char}
      </span>
    );
  };

  return (
    <div className="relative w-full transition-all duration-700">
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={(e) => onInput(e.target.value)}
        className="absolute opacity-0 pointer-events-none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
      />

      <div
        className={cn(
          'select-none cursor-text px-6 overflow-hidden flex items-start justify-center transition-all duration-500',
          !isTyping && 'opacity-90 scale-[0.99]',
          isTyping && 'scale-100'
        )}
        style={{ height: `${lineHeight * 3}px`, paddingTop: `${(lineHeight * 3 - lineHeight * 3) / 2}px` }}
        onClick={() => inputRef.current?.focus()}
      >
        <div 
          ref={containerRef}
          className={cn(
            "flex flex-wrap max-w-5xl transition-all duration-500 ease-in-out relative pt-2",
            isCodeMode ? "font-mono text-2xl gap-y-4" : "text-4xl gap-y-4 justify-center"
          )}
          style={{
            transform: `translateY(-${Math.max(0, lineIndex - 1) * lineHeight}px)`
          }}
        >
          {words.map((word, wordIdx) => {
            let globalCharIndex = word.startIndex;
            return (
              <div 
                key={wordIdx} 
                ref={(el) => { if (el) wordsRef.current[wordIdx] = el; }}
                className="inline-flex flex-nowrap"
              >
                {word.chars.map((cs, charIdx) => {
                  return renderCharacter(cs, globalCharIndex + charIdx);
                })}
              </div>
            );
          })}
        </div>
      </div>
      
      {!isTyping && status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-1000">
           <div className="px-6 py-2 rounded-full glass text-sm font-medium text-primary/70 border border-primary/20">
             Type to start...
           </div>
        </div>
      )}
    </div>
  );
}
