import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, Clock, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

interface Profile {
  name: string;
  age: string;
  class_level: string;
  created_at: string;
  user_id: string;
}

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (!session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    const fetchProfiles = async () => {
      // Users can only see their own profile due to RLS
      // For a full admin view, you'd need a service role or admin RLS policy
      const { data } = await supabase
        .from("profiles")
        .select("name, age, class_level, created_at, user_id")
        .order("created_at", { ascending: false });
      
      setProfiles(data || []);
      setLoading(false);
    };
    fetchProfiles();
  }, [session]);

  const completedProfiles = profiles.filter(p => p.name);
  const todaySignups = profiles.filter(p => {
    const created = new Date(p.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  const classCounts: Record<string, number> = {};
  completedProfiles.forEach(p => {
    const key = p.class_level || "Unknown";
    classCounts[key] = (classCounts[key] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-float">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-button">
            <span className="text-3xl">📊</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              📊 User Dashboard
            </h1>
            <p className="text-muted-foreground">Track your registered users</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-card">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-extrabold text-foreground">{profiles.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="pt-6 text-center">
              <UserPlus className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-extrabold text-foreground">{completedProfiles.length}</p>
              <p className="text-sm text-muted-foreground">Completed Profiles</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-extrabold text-foreground">{todaySignups.length}</p>
              <p className="text-sm text-muted-foreground">Today's Signups</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="pt-6 text-center">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-extrabold text-foreground">{Object.keys(classCounts).length}</p>
              <p className="text-sm text-muted-foreground">Class Levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Class Distribution */}
        {Object.keys(classCounts).length > 0 && (
          <Card className="border-0 shadow-card mb-8">
            <CardHeader>
              <CardTitle className="text-lg">📚 Users by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(classCounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([cls, count]) => (
                    <div
                      key={cls}
                      className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm"
                    >
                      Class {cls}: {count} user{count > 1 ? "s" : ""}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Users */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">👥 Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.user_id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                        {profile.name ? profile.name[0].toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {profile.name || "Incomplete profile"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile.age ? `Age ${profile.age}` : ""} 
                          {profile.class_level ? ` · Class ${profile.class_level}` : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
