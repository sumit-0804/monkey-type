import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, GraduationCap } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    avatarUrl: string;
    degree?: string;
    startYear?: number;
    createdAt: string;
    tags: string[];
  };
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calculateYear = (startYear: number, degree?: string) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    // Assuming academic year starts in August/September (month 7 or 8)
    const academicYear = currentMonth >= 7 ? currentYear : currentYear - 1;
    const year = academicYear - startYear + 1;
    
    if (year <= 0) return "Incoming Student";
    
    if (degree === "Masters" && year > 2) return "Alumni";
    if (degree === "Bachelors" && year > 4) return "Alumni";

    if (year === 1) return "1st Year";
    if (year === 2) return "2nd Year";
    if (year === 3) return "3rd Year";
    return `${year}th Year`;
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Avatar className="h-32 w-32 border-4 border-muted shadow-xl">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-4 text-center md:text-left">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight">
              {user.name}
            </h1>
            {user.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-lg text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
            <Mail className="h-4 w-4" />
            {isOwnProfile ? user.email : "Email hidden"}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-medium text-muted-foreground">
          {user.degree && user.startYear && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-muted-foreground/10">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>
                {calculateYear(user.startYear, user.degree)}, {user.degree}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-muted-foreground/10">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Joined {joinDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
