import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, RotateCcw, Home } from "lucide-react";
import StarRating from "./StarRating";
import { cn } from "@/lib/utils";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  subject: string;
  concepts: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  onRetry: () => void;
  onStartOver: () => void;
}

const getScoreMessage = (percentage: number) => {
  if (percentage >= 90) return { message: "Outstanding! 🌟", color: "text-green-600" };
  if (percentage >= 70) return { message: "Great job! 🎉", color: "text-blue-600" };
  if (percentage >= 50) return { message: "Good effort! 💪", color: "text-yellow-600" };
  return { message: "Keep practicing! 📚", color: "text-orange-600" };
};

const QuizResults = ({
  score,
  totalQuestions,
  subject,
  concepts,
  rating,
  onRatingChange,
  onRetry,
  onStartOver,
}: QuizResultsProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const scoreInfo = getScoreMessage(percentage);

  return (
    <div className="min-h-screen gradient-hero p-4 md:p-8 flex items-center justify-center">
      <Card className="max-w-md w-full shadow-card border-0 animate-scale-in">
        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Trophy Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center space-y-2">
            <h2 className={cn("text-2xl font-bold", scoreInfo.color)}>
              {scoreInfo.message}
            </h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Target className="w-5 h-5" />
              <span className="text-lg">Your Score</span>
            </div>
            <p className="text-5xl font-extrabold text-foreground">
              {score}/{totalQuestions}
            </p>
            <p className="text-lg text-muted-foreground">
              {percentage}% correct
            </p>
          </div>

          {/* Subject Info */}
          <div className="text-center text-sm text-muted-foreground border-t border-b py-4">
            <p><span className="font-semibold">Subject:</span> {subject}</p>
            <p><span className="font-semibold">Topics:</span> {concepts}</p>
          </div>

          {/* Star Rating */}
          <div className="py-4">
            <StarRating
              rating={rating}
              onRatingChange={onRatingChange}
              label="Rate this quiz experience"
            />
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Thanks for your {rating}-star rating! ⭐
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onRetry}
              className="w-full gradient-primary rounded-xl font-semibold shadow-button hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again with New Questions
            </Button>
            <Button
              onClick={onStartOver}
              variant="outline"
              className="w-full rounded-xl font-semibold"
            >
              <Home className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
