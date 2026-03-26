import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

interface BioEditorProps {
  initialBio: string;
  isOwnProfile: boolean;
}

export function BioEditor({ initialBio, isOwnProfile }: BioEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const handleSave = async () => {
    try {
      await updateProfile(bio);
      setIsEditing(false);
      toast.success("Bio updated successfully");
    } catch (error) {
      toast.error("Failed to update bio");
    }
  };

  if (!isOwnProfile) {
    return (
      <p className="text-muted-foreground italic leading-relaxed">
        {initialBio || "No bio yet..."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between group">
        <h3 className="text-lg font-semibold tracking-tight">About Me</h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your typing journey..."
            className="min-h-[120px] bg-muted/50 focus-visible:ring-primary"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBio(initialBio);
                setIsEditing(false);
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {initialBio || "Add a bio to express yourself!"}
        </p>
      )}
    </div>
  );
}
