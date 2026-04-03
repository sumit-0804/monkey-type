import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, Dices } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditProfileDialogProps {
  user: {
    name: string;
    avatarUrl: string;
    bio?: string;
    degree?: string;
    startYear?: number;
  };
  onSuccess: (updatedUser: any) => void;
}

export function EditProfileDialog({ user, onSuccess }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [bio, setBio] = useState(user.bio || "");
  const [degree, setDegree] = useState(user.degree || "");
  const [startYear, setStartYear] = useState(user.startYear || new Date().getFullYear());
  
  const { fetchSession, user: currentUser } = useAuthStore();

  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 10);
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setAvatarUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put("/users/profile", {
        name,
        avatarUrl,
        bio,
        degree: degree || undefined,
        startYear: Number(startYear) || undefined,
      });
      
      toast.success("Profile updated successfully!");
      if (currentUser?._id === res.data._id) {
        await fetchSession();
      }
      onSuccess(res.data);
      setOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex justify-center mb-6">
            <Avatar className="h-24 w-24 border-2 border-muted shadow-sm">
              <AvatarImage src={avatarUrl} alt="Avatar Preview" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <div className="flex gap-2">
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <Button type="button" variant="secondary" onClick={generateRandomAvatar} className="shrink-0" title="Generate Random Avatar">
                <Dices className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="degree">Degree</Label>
            <select
              id="degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a degree (Optional)</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startYear">Start Year</Label>
            <Input
              id="startYear"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
              placeholder="e.g. 2020"
              min="1900"
              max={new Date().getFullYear() + 5}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
