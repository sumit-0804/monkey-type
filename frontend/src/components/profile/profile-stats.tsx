import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Keyboard, Clock } from "lucide-react";

interface Stats {
  totalTests: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalTime?: number; // in seconds
}

export function ProfileStats({ stats }: { stats: Stats }) {
  const statCards = [
    {
      label: "Tests Started",
      value: stats.totalTests,
      icon: Keyboard,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Average WPM",
      value: Math.round(stats.avgWpm),
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Average Accuracy",
      value: `${Math.round(stats.avgAccuracy)}%`,
      icon: Target,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Time Typed",
      value: stats.totalTime ? `${Math.floor(stats.totalTime / 60)}m` : "0m",
      icon: Clock,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {statCards.map((stat, i) => (
        <Card key={i} className="border-muted hover:border-muted-foreground/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
