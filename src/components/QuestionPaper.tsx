import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Printer, ArrowLeft, FileText, Sparkles } from "lucide-react";

interface QuestionPaperProps {
  userName: string;
  classLevel: string;
  subject: string;
  concepts: string;
  onBack: () => void;
  onStartOver: () => void;
}

const generateQuestions = (subject: string, concepts: string): string[] => {
  const subjectTemplates: Record<string, string[]> = {
    mathematics: [
      "Solve the following problem related to {concept}",
      "Calculate and show your work for this {concept} question",
      "What is the formula used in {concept}?",
      "Explain how to solve problems involving {concept}",
      "If we apply {concept}, what would be the result?",
      "Draw a diagram to illustrate {concept}",
      "Write three examples of {concept}",
      "How do you simplify using {concept}?",
      "What is the relationship between {concept} and basic operations?",
      "Solve this word problem using {concept}",
    ],
    science: [
      "Explain the process of {concept} in your own words",
      "What are the main components involved in {concept}?",
      "Draw and label a diagram showing {concept}",
      "How does {concept} affect our daily life?",
      "Describe an experiment that demonstrates {concept}",
      "What would happen if {concept} didn't exist?",
      "Compare and contrast {concept} with related topics",
      "List five facts about {concept}",
      "Who discovered or studied {concept}?",
      "What safety precautions are important when studying {concept}?",
    ],
    english: [
      "Write a sentence using {concept} correctly",
      "Identify the {concept} in the given paragraph",
      "Explain the rules of {concept}",
      "Rewrite this sentence using proper {concept}",
      "Find examples of {concept} in your favorite book",
      "How does {concept} change the meaning of a sentence?",
      "Create a short story using {concept}",
      "What are common mistakes people make with {concept}?",
      "Compare these two uses of {concept}",
      "Edit this paragraph to fix {concept} errors",
    ],
    default: [
      "Explain what you know about {concept}",
      "Why is {concept} important to study?",
      "Describe three key facts about {concept}",
      "How can you apply {concept} in real life?",
      "What questions do you have about {concept}?",
      "Create a mind map showing {concept}",
      "Write a summary of {concept}",
      "Compare {concept} with something similar",
      "What would you like to learn more about {concept}?",
      "Draw or illustrate {concept}",
    ],
  };

  const templates = subjectTemplates[subject] || subjectTemplates.default;
  const conceptList = concepts.split(/[,\n]/).map((c) => c.trim()).filter(Boolean);
  const questions: string[] = [];

  for (let i = 0; i < 20; i++) {
    const template = templates[i % templates.length];
    const concept = conceptList[i % conceptList.length] || concepts;
    questions.push(template.replace("{concept}", concept));
  }

  return questions;
};

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

const QuestionPaper = ({
  userName,
  classLevel,
  subject,
  concepts,
  onBack,
  onStartOver,
}: QuestionPaperProps) => {
  const questions = generateQuestions(subject, concepts);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
            Your question paper is ready!
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
                <span>Total Questions: 20</span>
                <span>Time: 60 minutes</span>
              </div>

              <ol className="space-y-5 list-decimal list-inside">
                {questions.map((question, index) => (
                  <li
                    key={index}
                    className="text-base leading-relaxed pl-2 pb-4 border-b border-border/50 last:border-0"
                  >
                    <span className="font-medium">{question}</span>
                    <div className="mt-4 ml-6 border-b border-dotted border-muted-foreground/30 h-8" />
                    <div className="ml-6 border-b border-dotted border-muted-foreground/30 h-8" />
                  </li>
                ))}
              </ol>

              <div className="pt-8 border-t-2 border-dashed border-border text-center text-muted-foreground">
                <p className="font-semibold">✨ Good luck! You've got this! ✨</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer (Hidden on Print) */}
        <div className="no-print text-center mt-8 text-muted-foreground text-sm">
          <p>Made with ❤️ for curious learners</p>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaper;
