import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoginForm from "@/components/LoginForm";
import SubjectSelector from "@/components/SubjectSelector";
import QuestionPaper from "@/components/QuestionPaper";
import LoadingScreen from "@/components/LoadingScreen";

type AppStep = "login" | "select" | "loading" | "paper";

interface UserData {
  name: string;
  age: string;
  classLevel: string;
}

interface QuestionData {
  subject: string;
  concepts: string;
}

const Index = () => {
  const [step, setStep] = useState<AppStep>("login");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setStep("select");
  };

  const generateQuestions = async (data: QuestionData) => {
    if (!userData) return;

    try {
      const { data: responseData, error } = await supabase.functions.invoke(
        "generate-questions",
        {
          body: {
            subject: data.subject,
            concepts: data.concepts,
            age: userData.age,
            classLevel: userData.classLevel,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (responseData?.error) {
        throw new Error(responseData.error);
      }

      if (responseData?.questions) {
        setQuestions(responseData.questions);
        setQuestionData(data);
        setStep("paper");
      } else {
        throw new Error("No questions received");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Oops! Something went wrong",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
      setStep("select");
    }
  };

  const handleGenerate = async (data: QuestionData) => {
    setQuestionData(data);
    setStep("loading");
    await generateQuestions(data);
  };

  const handleRegenerate = async () => {
    if (!questionData) return;
    setIsRegenerating(true);
    await generateQuestions(questionData);
    setIsRegenerating(false);
  };

  const handleBackToSelect = () => {
    setStep("select");
  };

  const handleStartOver = () => {
    setUserData(null);
    setQuestionData(null);
    setQuestions([]);
    setStep("login");
  };

  const handleBackToLogin = () => {
    setStep("login");
  };

  if (step === "login") {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (step === "select" && userData) {
    return (
      <SubjectSelector
        userName={userData.name}
        onGenerate={handleGenerate}
        onBack={handleBackToLogin}
      />
    );
  }

  if (step === "loading") {
    return <LoadingScreen userName={userData?.name || "Student"} />;
  }

  if (step === "paper" && userData && questionData) {
    return (
      <QuestionPaper
        userName={userData.name}
        classLevel={userData.classLevel}
        subject={questionData.subject}
        concepts={questionData.concepts}
        questions={questions}
        onBack={handleBackToSelect}
        onStartOver={handleStartOver}
        onRegenerate={handleRegenerate}
        isLoading={isRegenerating}
      />
    );
  }

  return null;
};

export default Index;
