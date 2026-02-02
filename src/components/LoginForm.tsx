import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";

interface LoginFormProps {
  onLogin: (data: { name: string; age: string; classLevel: string }) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [classLevel, setClassLevel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && classLevel) {
      onLogin({ name, age, classLevel });
    }
  };

  const isFormValid = name.trim() && age.trim() && classLevel.trim();

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
            Let's start your learning adventure!
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card border-0 overflow-hidden">
          <CardHeader className="gradient-primary pb-8 pt-6">
            <CardTitle className="text-primary-foreground text-center text-xl font-bold">
              Tell Us About You! 🎒
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Your Name 👋
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-semibold">
                  Your Age 🎂
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="How old are you?"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
                  min={3}
                  max={18}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="text-base font-semibold">
                  Your Class 📚
                </Label>
                <Input
                  id="class"
                  type="text"
                  placeholder="e.g., 5th Grade"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
                  maxLength={20}
                />
              </div>

              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-14 text-lg font-bold rounded-xl gradient-primary shadow-button hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Let's Go! 🚀
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
