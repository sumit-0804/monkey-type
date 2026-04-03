import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Clock, Type, Code, Globe, User as UserIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LeaderboardEntry {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  wpm: number;
  accuracy: number;
  mode: string;
  testType: string;
  testAmount: number;
  punctuation: boolean;
  numbers: boolean;
  language?: string;
  createdAt: string;
}

const timeOptions = [15, 30, 60, 120];
const wordOptions = [25, 50, 75, 100];
const codeLanguages = ['javascript', 'python', 'java', 'cpp', 'go'];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [mode, setMode] = useState<'normal' | 'code'>('normal');
  const [testType, setTestType] = useState<'time' | 'words'>('time');
  const [testAmount, setTestAmount] = useState<number>(30);
  const [language, setLanguage] = useState<string>('');

  useEffect(() => {
    fetchLeaderboard();
  }, [mode, testType, testAmount, language]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const params: any = { mode };
      if (mode === 'normal') {
        params.testType = testType;
        if (testAmount !== 0) {
          params.testAmount = testAmount;
        }
      } else {
        if (language) params.language = language;
      }
      
      const { data } = await api.get('/results/leaderboard', { params });
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Award className="h-5 w-5 text-muted-foreground/50" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-2 mb-8 mt-4">
         <h1 className="text-4xl font-bold tracking-tight text-primary flex justify-center items-center gap-3">
           <Trophy className="h-10 w-10 text-yellow-500" />
           Leaderboard
         </h1>
         <p className="text-muted-foreground text-lg italic">The fastest fingers in the world.</p>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border border-white/5">
        <div className="flex flex-wrap gap-4 items-center">
          <Tabs value={mode} onValueChange={(v) => {
            const newMode = v as 'normal' | 'code';
            setMode(newMode);
            if (newMode === 'normal') {
              setTestAmount(30);
            }
          }} className="w-auto">
            <TabsList className="bg-background/50 border border-white/5">
              <TabsTrigger value="normal" className="gap-2">
                <Type className="h-4 w-4" /> Typing
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code className="h-4 w-4" /> Code
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === 'normal' && (
            <Tabs value={testType} onValueChange={(v) => {
              const newType = v as 'time' | 'words';
              setTestType(newType);
              setTestAmount(newType === 'time' ? 30 : 50);
            }} className="w-auto">
              <TabsList className="bg-background/50 border border-white/5">
                <TabsTrigger value="time" className="gap-2">
                  <Clock className="h-4 w-4" /> Time
                </TabsTrigger>
                <TabsTrigger value="words" className="gap-2">
                  <Type className="h-4 w-4" /> Words
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
            {mode === 'normal' && (
              <>
                <Button 
                  variant={testAmount === 0 ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setTestAmount(0)}
                  className="font-mono h-9 px-4 rounded-xl"
                >all</Button>
                
                {testType === 'time' ? (
                  timeOptions.map(t => (
                    <Button 
                      key={t} 
                      variant={testAmount === t ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setTestAmount(t)}
                      className="font-mono h-9 px-4 rounded-xl"
                    >{t}s</Button>
                  ))
                ) : (
                  wordOptions.map(w => (
                    <Button 
                      key={w} 
                      variant={testAmount === w ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setTestAmount(w)}
                      className="font-mono h-9 px-4 rounded-xl"
                    >{w}</Button>
                  ))
                )}
              </>
            )}
            {mode === 'code' && (
              <>
                <Button 
                  variant={language === '' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setLanguage('')}
                  className="h-9 px-4 rounded-xl"
                >All</Button>
                {codeLanguages.map(l => (
                  <Button 
                    key={l} 
                    variant={language === l ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setLanguage(l)}
                    className="h-9 px-4 rounded-xl"
                  >{l}</Button>
                ))}
              </>
            )}
        </div>
      </div>

      <Card className="border border-white/5 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-[100px] pl-8 font-bold text-xs uppercase tracking-wider opacity-60">Rank</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider opacity-60">User</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider opacity-60">WPM</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider opacity-60">Accuracy</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider opacity-60 pr-8">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-white/5">
                      <TableCell className="pl-8"><Skeleton className="h-6 w-12 bg-white/5" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full bg-white/5" />
                          <Skeleton className="h-4 w-32 bg-white/5" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-12 ml-auto bg-white/5" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-12 ml-auto bg-white/5" /></TableCell>
                      <TableCell className="pr-8"><Skeleton className="h-6 w-24 ml-auto bg-white/5" /></TableCell>
                    </TableRow>
                  ))
                ) : entries.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-80 text-center border-none">
                        <div className="flex flex-col items-center justify-center opacity-40 py-20">
                           <Globe className="h-16 w-16 mb-4 animate-pulse" />
                           <p className="text-xl font-medium">No records yet</p>
                           <p className="text-sm">Be the first to claim a spot on this leaderboard!</p>
                        </div>
                     </TableCell>
                  </TableRow>
                ) : entries.map((entry, index) => {
                  return (
                  <TableRow key={entry._id} className={cn(
                    "group transition-all hover:bg-white/5 border-white/5",
                    index === 0 && "bg-yellow-500/5 hover:bg-yellow-500/10",
                    index === 1 && "bg-gray-400/5 hover:bg-gray-400/10",
                    index === 2 && "bg-amber-600/5 hover:bg-amber-600/10"
                  )}>
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-4">
                         <span className="opacity-30 font-mono text-xs w-6 whitespace-nowrap">#{index + 1}</span>
                         <span className="group-hover:scale-125 transition-transform duration-300">
                           {getRankIcon(index + 1)}
                         </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-transparent transition-all group-hover:ring-primary/20">
                          <AvatarImage src={entry.user.avatarUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <UserIcon className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                            {entry.user.name || 'Anonymous User'}
                          </span>
                          <div className="flex gap-1.5 mt-0.5 items-center">
                             <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-muted/40 font-mono text-muted-foreground whitespace-nowrap capitalize">
                                {entry.testAmount}{entry.testType === 'time' ? 's' : 'w'}
                             </Badge>
                             {entry.testType === 'time' && (
                                <Clock className="h-2.5 w-2.5 opacity-20" />
                             )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={index < 3 ? 'default' : 'secondary'} className={cn(
                        "font-mono text-lg px-4 py-1.5 rounded-lg border-none shadow-sm transition-all duration-300 group-hover:scale-105",
                        index === 0 && "bg-yellow-500 text-yellow-950 shadow-yellow-500/20",
                        index === 1 && "bg-gray-400 text-gray-950 shadow-gray-400/20",
                        index === 2 && "bg-amber-600 text-amber-50 shadow-amber-600/20",
                        index > 2 && "bg-secondary/40 text-foreground"
                      )}>
                        {entry.wpm}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-foreground/80">{entry.accuracy}%</span>
                        <span className="text-[10px] uppercase tracking-tighter opacity-30 font-bold">accuracy</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <span className="text-xs text-muted-foreground font-mono bg-muted/20 px-2 py-1 rounded">
                        {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                      </span>
                    </TableCell>
                  </TableRow>
                );})}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="text-center opacity-30 text-xs font-mono uppercase tracking-[0.2em] pb-10">
         Updated in real-time • Turbo Type Rankings
      </div>
    </div>
  );
}
