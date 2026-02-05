import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, PenTool, ArrowLeft } from "lucide-react";

interface SubjectSelectorProps {
  userName: string;
  onGenerate: (data: { subject: string; concepts: string; complexity: string }) => void;
  onBack: () => void;
}

const complexityLevels = [
  { value: "easy", label: "Easy 🌱", description: "Simple questions for beginners" },
  { value: "medium", label: "Medium 🌿", description: "Balanced challenge" },
  { value: "hard", label: "Hard 🌳", description: "Advanced & challenging" },
];

const subjects = [
  { value: "mathematics", label: "Mathematics 🔢", emoji: "🔢" },
  { value: "science", label: "Science 🔬", emoji: "🔬" },
  { value: "english", label: "English 📖", emoji: "📖" },
  { value: "history", label: "History 🏛️", emoji: "🏛️" },
  { value: "geography", label: "Geography 🌍", emoji: "🌍" },
  { value: "art", label: "Art 🎨", emoji: "🎨" },
  { value: "music", label: "Music 🎵", emoji: "🎵" },
  { value: "computer-science", label: "Computer Science 💻", emoji: "💻" },
  { value: "biology", label: "Biology 🧬", emoji: "🧬" },
  { value: "physics", label: "Physics ⚡", emoji: "⚡" },
  { value: "chemistry", label: "Chemistry 🧪", emoji: "🧪" },
  { value: "social-studies", label: "Social Studies 👥", emoji: "👥" },
];

const SubjectSelector = ({ userName, onGenerate, onBack }: SubjectSelectorProps) => {
  const [subject, setSubject] = useState("");
  const [concepts, setConcepts] = useState("");
  const [complexity, setComplexity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && concepts.trim() && complexity) {
      onGenerate({ subject, concepts, complexity });
    }
  };

  const isFormValid = subject && concepts.trim() && complexity;

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-secondary rounded-2xl shadow-button mb-4 animate-float">
            <Lightbulb className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Hey, {userName}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            What would you like to learn today?
          </p>
        </div>

        {/* Selection Card */}
        <Card className="shadow-card border-0 overflow-hidden">
          <CardHeader className="gradient-secondary pb-6 pt-6">
            <CardTitle className="text-secondary-foreground text-center text-xl font-bold flex items-center justify-center gap-2">
              <PenTool className="w-6 h-6" />
              Create Your Question Paper
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-semibold">
                  Select a Subject 📚
                </Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="h-12 text-base rounded-xl border-2 focus:border-primary transition-colors bg-background">
                    <SelectValue placeholder="Choose your subject..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border rounded-xl shadow-lg z-50">
                    {subjects.map((subj) => (
                      <SelectItem
                        key={subj.value}
                        value={subj.value}
                        className="text-base py-3 cursor-pointer hover:bg-muted rounded-lg"
                      >
                        {subj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concepts" className="text-base font-semibold">
                  What do you want to learn? 💡
                </Label>
                <Textarea
                  id="concepts"
                  placeholder="Enter the topics or concepts you want to practice (e.g., fractions, photosynthesis, grammar rules...)"
                  value={concepts}
                  onChange={(e) => setConcepts(e.target.value)}
                  className="min-h-[100px] text-base rounded-xl border-2 focus:border-primary transition-colors resize-none"
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {concepts.length}/500 characters
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Complexity Level 🎯
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {complexityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setComplexity(level.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        complexity === level.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="text-lg font-bold">{level.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {level.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-14 text-lg font-bold rounded-xl gradient-success shadow-button hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Questions! ✨
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectSelector;
