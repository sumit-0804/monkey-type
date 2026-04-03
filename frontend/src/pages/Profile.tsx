import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/axios";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileHistory } from "@/components/profile/profile-history";
import { BioEditor } from "@/components/profile/bio-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoading: authLoading } = useAuthStore();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const targetId = userId || currentUser?._id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetId) {
        if (!authLoading && !currentUser) {
          setError("Please login to view your profile");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user info, stats, and history in parallel
        const [userRes, statsRes, historyRes] = await Promise.all([
          isOwnProfile ? Promise.resolve({ data: currentUser }) : api.get(`/users/${targetId}`),
          api.get(`/results/stats/${targetId}`),
          isOwnProfile ? api.get(`/results/me`) : api.get(`/results/user/${targetId}`),
        ]);

        setProfileUser(userRes.data);
        setStats(statsRes.data);
        setHistory(historyRes.data);
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetId, currentUser, isOwnProfile, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Profile Error</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          {error || "We couldn't find the profile you're looking for."}
        </p>
        <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700">
      <ProfileHeader 
        user={profileUser} 
        isOwnProfile={isOwnProfile} 
        onUpdate={(updatedUser) => setProfileUser(updatedUser)}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Recent Activity
            </h2>
            <ProfileHistory results={history} />
          </section>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <section className="p-6 rounded-2xl bg-muted/30 border border-muted-foreground/10 space-y-6">
            <BioEditor initialBio={profileUser.bio} isOwnProfile={isOwnProfile} />
          </section>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Performance Summary</h2>
        {stats && <ProfileStats stats={stats} />}
      </section>
    </div>
  );
}
