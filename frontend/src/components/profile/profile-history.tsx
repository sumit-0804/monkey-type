import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";

interface TestResult {
  _id: string;
  wpm: number;
  accuracy: number;
  mode: string;
  language?: string;
  createdAt: string;
}

export function ProfileHistory({ results }: { results: TestResult[] }) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/5 animate-in fade-in duration-500">
        <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground">No test history</h3>
        <p className="text-muted-foreground/60 max-w-xs mx-auto mt-2">
          Your typing journey is just beginning. Take a test to see your stats here!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-muted bg-card overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[100px]">WPM</TableHead>
            <TableHead>Accuracy</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Language</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result._id} className="hover:bg-muted/10 transition-colors">
              <TableCell className="font-bold text-lg text-primary">
                {result.wpm}
              </TableCell>
              <TableCell className="font-medium">
                {result.accuracy}%
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize text-xs font-semibold">
                  {result.mode}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {result.language || "English"}
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
