import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Sparkles, Mail, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({
          title: "Check your email! 📧",
          description: "We sent you a verification link. Please confirm your email to continue.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Oops!",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() && password.length >= 6;

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-2xl shadow-button mb-4 animate-float">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">
            Learn & Play! <Sparkles className="inline w-8 h-8 text-secondary" />
          </h1>
          <p className="text-muted-foreground text-lg">
            {isSignUp ? "Create your account to start learning!" : "Welcome back, learner!"}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-card border-0 overflow-hidden">
          <CardHeader className="gradient-primary pb-8 pt-6">
            <CardTitle className="text-primary-foreground text-center text-xl font-bold">
              {isSignUp ? "Sign Up 🎉" : "Log In 🎒"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  <Mail className="inline w-4 h-4 mr-1" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold">
                  <Lock className="inline w-4 h-4 mr-1" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full h-14 text-lg font-bold rounded-xl gradient-primary shadow-button hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? "Please wait..." : isSignUp ? "Create Account 🚀" : "Let's Go! 🚀"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-semibold hover:underline text-sm"
              >
                {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
