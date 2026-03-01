import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Plus, UserCircle, Trash2, ArrowLeft, LogOut, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  age: string;
  class_level: string;
}

interface ProfilePickerProps {
  userId: string;
  onSelectProfile: (profile: { name: string; age: string; classLevel: string }) => void;
  onLogout: () => void;
}

const ProfilePicker = ({ userId, onSelectProfile, onLogout }: ProfilePickerProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, [userId]);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, age, class_level")
      .eq("user_id", userId)
      .neq("name", "");

    if (error) {
      console.error("Error loading profiles:", error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !age.trim() || !classLevel.trim()) return;

    if (editingId) {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim(), age: age.trim(), class_level: classLevel.trim() })
        .eq("id", editingId)
        .eq("user_id", userId);

      if (error) {
        toast({ title: "Error updating profile", variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase
        .from("profiles")
        .insert({ user_id: userId, name: name.trim(), age: age.trim(), class_level: classLevel.trim() });

      if (error) {
        toast({ title: "Error creating profile", variant: "destructive" });
        return;
      }
    }

    resetForm();
    loadProfiles();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error deleting profile", variant: "destructive" });
      return;
    }
    loadProfiles();
  };

  const handleEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setAge(profile.age);
    setClassLevel(profile.class_level);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setAge("");
    setClassLevel("");
  };

  const avatarColors = [
    "gradient-primary",
    "gradient-secondary",
    "gradient-success",
    "gradient-fun",
  ];

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-float">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-button">
            <span className="text-3xl">👨‍👩‍👧‍👦</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-fun rounded-2xl shadow-button mb-4 animate-float">
            <span className="text-4xl">👨‍👩‍👧‍👦</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Who's Learning Today? 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            Select a profile or create a new one
          </p>
        </div>

        {/* Profile Cards */}
        {profiles.length > 0 && !showForm && (
          <div className="grid gap-4 mb-6">
            {profiles.map((profile, index) => (
              <Card
                key={profile.id}
                className="shadow-card border-0 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() =>
                  onSelectProfile({
                    name: profile.name,
                    age: profile.age,
                    classLevel: profile.class_level,
                  })
                }
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`w-14 h-14 ${avatarColors[index % avatarColors.length]} rounded-xl flex items-center justify-center shadow-soft shrink-0`}
                  >
                    <span className="text-2xl font-bold text-primary-foreground">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Age {profile.age} · {profile.class_level}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(profile);
                      }}
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(profile.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Profile Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full h-14 text-lg font-bold rounded-xl gradient-primary shadow-button hover:opacity-90 transition-all duration-200"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add a Kid Profile
          </Button>
        )}

        {/* Add/Edit Profile Form */}
        {showForm && (
          <Card className="shadow-card border-0 overflow-hidden animate-scale-in">
            <CardHeader className="gradient-primary pb-6 pt-6">
              <CardTitle className="text-primary-foreground text-center text-xl font-bold">
                {editingId ? "Edit Profile ✏️" : "New Profile 🎒"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-base font-semibold">
                    Kid's Name 👋
                  </Label>
                  <Input
                    id="profile-name"
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-age" className="text-base font-semibold">
                    Age 🎂
                  </Label>
                  <Input
                    id="profile-age"
                    type="number"
                    placeholder="How old?"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
                    min={3}
                    max={18}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-class" className="text-base font-semibold">
                    Class 📚
                  </Label>
                  <Input
                    id="profile-class"
                    type="text"
                    placeholder="e.g., 5th Grade"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
                    maxLength={20}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 h-12 text-base font-semibold rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={!name.trim() || !age.trim() || !classLevel.trim()}
                    className="flex-1 h-12 text-base font-bold rounded-xl gradient-primary shadow-button hover:opacity-90 disabled:opacity-50"
                  >
                    {editingId ? "Save Changes" : "Add Profile"} 🚀
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePicker;
