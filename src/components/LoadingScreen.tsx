import { Sparkles, Brain, BookOpen, Lightbulb } from "lucide-react";

interface LoadingScreenProps {
  userName: string;
}

const LoadingScreen = ({ userName }: LoadingScreenProps) => {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="text-center space-y-8 animate-scale-in">
        {/* Animated Icons */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center animate-float shadow-button">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <div
            className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center animate-float shadow-soft"
            style={{ animationDelay: "0.5s" }}
          >
            <Lightbulb className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div
            className="w-14 h-14 gradient-success rounded-2xl flex items-center justify-center animate-float shadow-soft"
            style={{ animationDelay: "1s" }}
          >
            <BookOpen className="w-7 h-7 text-accent-foreground" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-secondary animate-pulse" />
            Creating Your Questions
            <Sparkles className="w-7 h-7 text-secondary animate-pulse" />
          </h2>
          <p className="text-lg text-muted-foreground">
            Hold on, {userName}! Our AI is crafting the perfect questions for you...
          </p>
        </div>

        {/* Loading Bar */}
        <div className="max-w-xs mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full animate-loading-bar" />
          </div>
        </div>

        {/* Fun Facts */}
        <div className="pt-4">
          <p className="text-sm text-muted-foreground italic">
            💡 Fun fact: Learning is like exercising your brain - the more you practice, the stronger it gets!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 70%;
            margin-left: 15%;
          }
          100% {
            width: 100%;
            margin-left: 0%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
