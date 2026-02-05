import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Printer, ArrowLeft, FileText, Sparkles, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuestionItem {
  question: string;
  options: string[];
  correctAnswers: number[];
}

interface QuestionPaperProps {
  userName: string;
  classLevel: string;
  subject: string;
  concepts: string;
  complexity: string;
  questions: QuestionItem[];
  onBack: () => void;
  onStartOver: () => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}

const getSubjectName = (value: string): string => {
  const subjects: Record<string, string> = {
    mathematics: "Mathematics",
    science: "Science",
    english: "English",
    history: "History",
    geography: "Geography",
    art: "Art",
    music: "Music",
    "computer-science": "Computer Science",
    biology: "Biology",
    physics: "Physics",
    chemistry: "Chemistry",
    "social-studies": "Social Studies",
  };
  return subjects[value] || value;
};

const getComplexityLabel = (value: string): { label: string; color: string } => {
  const levels: Record<string, { label: string; color: string }> = {
    easy: { label: "Easy 🌱", color: "bg-green-100 text-green-800" },
    medium: { label: "Medium 🌿", color: "bg-yellow-100 text-yellow-800" },
    hard: { label: "Hard 🌳", color: "bg-red-100 text-red-800" },
  };
  return levels[value] || { label: value, color: "bg-muted text-muted-foreground" };
};

const QuestionPaper = ({
  userName,
  classLevel,
  subject,
  concepts,
  complexity,
  questions,
  onBack,
  onStartOver,
  onRegenerate,
  isLoading,
}: QuestionPaperProps) => {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const complexityInfo = getComplexityLabel(complexity);
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen gradient-hero p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Control Buttons (Hidden on Print) */}
        <div className="no-print flex flex-wrap gap-4 mb-6 animate-slide-up">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Change Topics
          </button>
          <div className="flex-1" />
          <Button
            onClick={onRegenerate}
            disabled={isLoading}
            variant="outline"
            className="rounded-xl font-semibold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            New Questions
          </Button>
          <Button
            onClick={onStartOver}
            variant="outline"
            className="rounded-xl font-semibold"
          >
            Start Over
          </Button>
          <Button
            onClick={handlePrint}
            className="gradient-primary rounded-xl font-semibold shadow-button hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Paper
          </Button>
        </div>

        {/* Success Message (Hidden on Print) */}
        <div className="no-print text-center mb-6 animate-scale-in">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full font-semibold">
            <Sparkles className="w-5 h-5" />
            Your AI-generated question paper is ready!
          </div>
        </div>

        {/* Question Paper */}
        <Card className="shadow-card border-0 print-paper animate-slide-up">
          <CardHeader className="border-b-2 border-dashed border-border pb-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3 no-print">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                {getSubjectName(subject)} Question Paper
              </h1>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="font-semibold">Student: {userName}</span>
                <span>•</span>
                <span className="font-semibold">Class: {classLevel}</span>
                <span>•</span>
                <span className="font-semibold">Date: {currentDate}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${complexityInfo.color}`}>
                  {complexityInfo.label}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Topics covered:</span> {concepts}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground border-b pb-2">
                <span>Total Questions: {questions.length}</span>
                <span>Time: 60 minutes</span>
              </div>

              <div className="space-y-8">
                {questions.map((item, index) => {
                  const hasMultipleCorrect = item.correctAnswers.length > 1;
                  
                  return (
                    <div
                      key={index}
                      className="pb-6 border-b border-border/50 last:border-0"
                    >
                      <div className="flex gap-2 mb-4">
                        <span className="font-bold text-primary">{index + 1}.</span>
                        <span className="font-medium">{item.question}</span>
                        {hasMultipleCorrect && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
                            Multiple answers
                          </span>
                        )}
                      </div>
                      
                      <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            {hasMultipleCorrect ? (
                              <Checkbox id={`q${index}-opt${optIdx}`} className="print:border-2" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-primary print:border-2" />
                            )}
                            <Label
                              htmlFor={`q${index}-opt${optIdx}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              <span className="font-semibold text-primary mr-2">
                                {optionLabels[optIdx]}.
                              </span>
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-8 border-t-2 border-dashed border-border text-center text-muted-foreground">
                <p className="font-semibold">✨ Good luck! You've got this! ✨</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer (Hidden on Print) */}
        <div className="no-print text-center mt-8 text-muted-foreground text-sm">
          <p>Made with ❤️ for curious learners • Powered by AI</p>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaper;
