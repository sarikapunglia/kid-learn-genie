import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthPage from "@/components/AuthPage";
import LoginForm from "@/components/LoginForm";
import SubjectSelector from "@/components/SubjectSelector";
import QuestionPaper from "@/components/QuestionPaper";
import LoadingScreen from "@/components/LoadingScreen";
import type { Session } from "@supabase/supabase-js";

type AppStep = "auth" | "login" | "select" | "loading" | "paper";

interface UserData {
  name: string;
  age: string;
  classLevel: string;
}

interface QuestionData {
  subject: string;
  concepts: string;
  complexity: string;
}

interface QuestionItem {
  question: string;
  options: string[];
  correctAnswers: number[];
}

const Index = () => {
  const [step, setStep] = useState<AppStep>("auth");
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          // Check if profile has name filled in
          setTimeout(() => loadProfile(session.user.id), 0);
        } else {
          setStep("auth");
          setUserData(null);
          setAuthLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("name, age, class_level")
      .eq("user_id", userId)
      .single();

    if (data && data.name) {
      setUserData({ name: data.name, age: data.age, classLevel: data.class_level });
      setStep("select");
    } else {
      setStep("login");
    }
    setAuthLoading(false);
  };

  const handleAuthSuccess = () => {
    // onAuthStateChange will handle the rest
  };

  const handleLogin = async (data: UserData) => {
    if (!session) return;
    // Save profile data
    await supabase
      .from("profiles")
      .update({ name: data.name, age: data.age, class_level: data.classLevel })
      .eq("user_id", session.user.id);

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
            complexity: data.complexity,
            age: userData.age,
            classLevel: userData.classLevel,
          },
        }
      );

      if (error) throw new Error(error.message);
      if (responseData?.error) throw new Error(responseData.error);

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

  const handleBackToSelect = () => setStep("select");

  const handleStartOver = () => {
    setQuestionData(null);
    setQuestions([]);
    setStep("select");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserData(null);
    setQuestionData(null);
    setQuestions([]);
    setStep("auth");
  };

  const handleBackToLogin = () => setStep("login");

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-float">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-button">
            <span className="text-3xl">📚</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === "auth") {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (step === "login") {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (step === "select" && userData) {
    return (
      <SubjectSelector
        userName={userData.name}
        onGenerate={handleGenerate}
        onBack={handleLogout}
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
        complexity={questionData.complexity}
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
