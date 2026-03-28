import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import type { TestResult } from '@/components/typing/ResultsModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Leaderboard() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'typing' | 'code'>('all');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = () => {
    const savedResults = localStorage.getItem('turbo-type-results');
    if (savedResults) {
      const parsed: TestResult[] = JSON.parse(savedResults);
      parsed.sort((a, b) => b.wpm - a.wpm);
      setResults(parsed);
    }
  };

  const filteredResults = results.filter((r) => {
    if (filter === 'all') return true;
    return r.mode === filter;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Top typing speeds from all tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'typing' | 'code')} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="typing">Typing</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No results yet. Be the first to complete a test!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Config</TableHead>
                    <TableHead className="text-right">WPM</TableHead>
                    <TableHead className="text-right">Raw</TableHead>
                    <TableHead className="text-right">Accuracy</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.slice(0, 50).map((result, index) => (
                    <TableRow key={result.id} className={index < 3 ? 'bg-muted/50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(index + 1)}
                          <span>#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{result.name}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{result.config}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default" className="font-mono">
                          {result.wpm}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-muted-foreground text-sm">{result.rawWpm}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono">{result.accuracy}%</span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDate(result.date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
