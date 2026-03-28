import { Button } from '@/components/ui/button';
import { Hash, Clock, Code, AtSign, Type, Settings2 } from 'lucide-react';
import type { CodeLanguage } from '@/lib/textSamples';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils';

export type ConfigMode = 'normal' | 'code';
export type TestType = 'time' | 'words';

interface ConfigPanelProps {
  mode: ConfigMode;
  onModeChange: (mode: ConfigMode) => void;

  testType: TestType;
  onTestTypeChange: (type: TestType) => void;

  punctuation: boolean;
  onPunctuationChange: (value: boolean) => void;

  numbers: boolean;
  onNumbersChange: (value: boolean) => void;

  timeLimit: number;
  onTimeLimitChange: (time: number) => void;

  wordCount: number;
  onWordCountChange: (count: number) => void;

  codeLanguage: CodeLanguage;
  onCodeLanguageChange: (lang: CodeLanguage) => void;
}

const timeOptions = [15, 30, 60, 120];
const wordOptions = [25, 50, 75, 100];
const codeLanguages: { value: CodeLanguage; label: string }[] = [
  { value: 'javascript', label: 'javascript' },
  { value: 'python', label: 'python' },
  { value: 'java', label: 'java' },
  { value: 'cpp', label: 'c++' },
  { value: 'c', label: 'c' },
  { value: 'go', label: 'go' },
];

export function ConfigPanel({
  mode,
  onModeChange,
  testType,
  onTestTypeChange,
  punctuation,
  onPunctuationChange,
  numbers,
  onNumbersChange,
  timeLimit,
  onTimeLimitChange,
  wordCount,
  onWordCountChange,
  codeLanguage,
  onCodeLanguageChange,
}: ConfigPanelProps) {
  
  const renderSettingsList = (isMobile = false) => (
    <div className={cn(
      "flex items-center justify-center",
      isMobile ? "flex-col w-full gap-4" : "flex-row gap-2 sm:gap-6"
    )}>
      <div className={cn("flex items-center gap-2", isMobile && "flex-col w-full")}>
        {mode === 'normal' && (
          <Button
            variant={punctuation ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPunctuationChange(!punctuation)}
            className={cn(
              "gap-2 rounded-lg transition-all",
              isMobile ? "w-full py-6 font-mono text-lg" : "hover:bg-primary/20"
            )}
            style={isMobile && punctuation ? { backgroundColor: '#e2b714', color: '#000' } : undefined}
          >
            <AtSign className="h-4 w-4" />
            punctuation
          </Button>
        )}

        {mode === 'normal' && (
          <Button
            variant={numbers ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNumbersChange(!numbers)}
            className={cn(
              "gap-2 rounded-lg transition-all",
              isMobile ? "w-full py-6 font-mono text-lg" : "hover:bg-primary/20"
            )}
            style={isMobile && numbers ? { backgroundColor: '#e2b714', color: '#000' } : undefined}
          >
            <Hash className="h-4 w-4" />
            numbers
          </Button>
        )}
      </div>

      {!isMobile && <div className="h-6 w-px bg-white/10 hidden sm:block" />}
      {isMobile && <div className="h-px w-full bg-white/5 my-2" />}

      <div className={cn("flex items-center gap-2", isMobile && "flex-col w-full")}>
        <Button
          variant={testType === 'time' && mode !== 'code' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            onTestTypeChange('time');
            if (mode === 'code') onModeChange('normal');
          }}
          className={cn(
            "gap-2 rounded-lg transition-all",
            isMobile ? "w-full py-6 font-mono text-lg" : "hover:bg-primary/20"
          )}
          style={isMobile && testType === 'time' && mode !== 'code' ? { backgroundColor: '#e2b714', color: '#000' } : undefined}
        >
          <Clock className="h-4 w-4" />
          time
        </Button>

        <Button
          variant={testType === 'words' && mode !== 'code' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            onTestTypeChange('words');
            if (mode === 'code') onModeChange('normal');
          }}
          className={cn(
            "gap-2 rounded-lg transition-all",
            isMobile ? "w-full py-6 font-mono text-lg" : "hover:bg-primary/20"
          )}
          style={isMobile && testType === 'words' && mode !== 'code' ? { backgroundColor: '#e2b714', color: '#000' } : undefined}
        >
          <Type className="h-4 w-4" />
          words
        </Button>

        <Button
          variant={mode === 'code' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange(mode === 'code' ? 'normal' : 'code')}
          className={cn(
            "gap-2 rounded-lg transition-all",
            isMobile ? "w-full py-6 font-mono text-lg" : "hover:bg-primary/20"
          )}
          style={isMobile && mode === 'code' ? { backgroundColor: '#e2b714', color: '#000' } : undefined}
        >
          <Code className="h-4 w-4" />
          code
        </Button>
      </div>

      {!isMobile && <div className="h-6 w-px bg-white/10 hidden sm:block" />}
      {isMobile && <div className="h-px w-full bg-white/5 my-2" />}

      <div className={cn("flex items-center gap-1", isMobile && "flex-col w-full gap-2")}>
        {mode === 'normal' && testType === 'time' && (
          <div className={cn("flex animate-in fade-in duration-300", isMobile ? "flex-col w-full gap-2" : "gap-1")}>
            {timeOptions.map((time) => (
              <Button
                key={time}
                variant={timeLimit === time ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "rounded-lg transition-all",
                  isMobile ? "w-full py-6 font-mono text-lg" : "w-12 h-9 hover:scale-110 active:scale-95"
                )}
                style={isMobile && timeLimit === time ? { backgroundColor: '#e2b714', color: '#000' } : undefined}
                onClick={() => onTimeLimitChange(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        )}

        {mode === 'normal' && testType === 'words' && (
          <div className={cn("flex animate-in fade-in duration-300", isMobile ? "flex-col w-full gap-2" : "gap-1")}>
            {wordOptions.map((count) => (
              <Button
                key={count}
                variant={wordCount === count ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "rounded-lg transition-all",
                  isMobile ? "w-full py-6 font-mono text-lg" : "w-12 h-9 hover:scale-110 active:scale-95"
                )}
                style={isMobile && wordCount === count ? { backgroundColor: '#e2b714', color: '#000' } : undefined}
                onClick={() => onWordCountChange(count)}
              >
                {count}
              </Button>
            ))}
          </div>
        )}

        {mode === 'code' && (
          <div className={cn("flex items-center animate-in fade-in duration-300", isMobile ? "flex-col w-full gap-4" : "gap-4")}>
            <div className={cn("flex flex-wrap", isMobile ? "justify-center gap-2" : "gap-1")}>
              {codeLanguages.map((lang) => (
                <Button
                  key={lang.value}
                  variant={codeLanguage === lang.value ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "rounded-lg transition-all",
                    isMobile ? "px-6 py-6 font-mono text-base bg-secondary/30" : "hover:bg-primary/20"
                  )}
                  onClick={() => onCodeLanguageChange(lang.value)}
                >
                  {lang.label}
                </Button>
              ))}
            </div>

            {!isMobile && <div className="h-6 w-px bg-white/10" />}

            <div className="flex gap-2">
              <Button
                variant={testType === 'time' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTestTypeChange('time')}
                className={cn(
                  "rounded-lg transition-all",
                  isMobile ? "p-6 bg-secondary/30" : ""
                )}
              >
                <Clock className="h-4 w-4" />
              </Button>
              <Button
                variant={testType === 'words' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTestTypeChange('words')}
                className={cn(
                  "rounded-lg transition-all",
                  isMobile ? "p-6 bg-secondary/30" : ""
                )}
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-wrap items-center justify-center mb-8 glass rounded-2xl px-8 py-3 self-center animate-in slide-in-from-top-4 duration-500">
        {renderSettingsList()}
      </div>

      {/* Mobile View */}
      <div className="flex md:hidden items-center justify-center mb-6">
        <Dialog>
          <DialogTrigger render={
            <Button variant="ghost" className="gap-2 px-6 py-5 rounded-xl bg-secondary/40 hover:bg-secondary/60 text-foreground/70 transition-all active:scale-95">
              <Settings2 className="h-4 w-4" />
              <span>Test settings</span>
            </Button>
          } />
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xs border-white/5 bg-[#1a1b21]/95 backdrop-blur-xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-center font-mono opacity-50 uppercase tracking-widest text-xs">
                config
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {renderSettingsList(true)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
