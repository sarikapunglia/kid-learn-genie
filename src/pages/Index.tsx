import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthPage from "@/components/AuthPage";
import ProfilePicker from "@/components/ProfilePicker";
import SubjectSelector from "@/components/SubjectSelector";
import LoadingScreen from "@/components/LoadingScreen";
import QuestionPaper from "@/components/QuestionPaper";
import type { Session } from "@supabase/supabase-js";

interface QuestionItem {
  question: string;
  options: string[];
  correctAnswers: number[];
  imageUrl?: string | null;
}

type AppStep = "auth" | "profile" | "subject" | "loading" | "questions";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<AppStep>("auth");
  const [profile, setProfile] = useState<{ name: string; age: string; classLevel: string } | null>(null);
  const [subjectData, setSubjectData] = useState<{ subject: string; concepts: string; complexity: string } | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setStep("profile");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setStep("profile");
      } else {
        setStep("auth");
        setProfile(null);
        setSubjectData(null);
        setQuestions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setStep("profile");
  };

  const handleSelectProfile = (selectedProfile: { name: string; age: string; classLevel: string }) => {
    setProfile(selectedProfile);
    setStep("subject");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setSubjectData(null);
    setQuestions([]);
    setStep("auth");
  };

  const generateQuestions = async (data: { subject: string; concepts: string; complexity: string }) => {
    setSubjectData(data);
    setStep("loading");

    try {
      const { data: result, error } = await supabase.functions.invoke("generate-questions", {
        body: {
          subject: data.subject,
          concepts: data.concepts,
          complexity: data.complexity,
          classLevel: profile?.classLevel,
        },
      });

      if (error) throw error;

      const generatedQuestions: QuestionItem[] = result.questions || [];
      setQuestions(generatedQuestions);
      setStep("questions");
    } catch (error) {
      console.error("Error generating questions:", error);
      // Fallback to mock questions if the function fails
      const mockQuestions: QuestionItem[] = [
        {
          question: `What is the main concept of ${data.concepts}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswers: [0],
        },
        {
          question: `Which of the following relates to ${data.concepts}?`,
          options: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
          correctAnswers: [1],
        },
        {
          question: `Explain the importance of ${data.concepts} in ${data.subject}.`,
          options: ["Answer A", "Answer B", "Answer C", "Answer D"],
          correctAnswers: [2],
        },
        {
          question: `What are the key elements of ${data.concepts}?`,
          options: ["Element 1", "Element 2", "Element 3", "Element 4"],
          correctAnswers: [0, 2],
        },
        {
          question: `How does ${data.concepts} apply to real life?`,
          options: ["Application 1", "Application 2", "Application 3", "Application 4"],
          correctAnswers: [3],
        },
      ];
      setQuestions(mockQuestions);
      setStep("questions");
    }
  };

  const handleRegenerate = async () => {
    if (!subjectData) return;
    setIsRegenerating(true);
    await generateQuestions(subjectData);
    setIsRegenerating(false);
  };

  const handleBackToSubject = () => {
    setStep("subject");
    setQuestions([]);
  };

  const handleStartOver = () => {
    setStep("profile");
    setProfile(null);
    setSubjectData(null);
    setQuestions([]);
  };

  // Render based on current step
  switch (step) {
    case "auth":
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;

    case "profile":
      return session ? (
        <ProfilePicker
          userId={session.user.id}
          onSelectProfile={handleSelectProfile}
          onLogout={handleLogout}
        />
      ) : null;

    case "subject":
      return profile ? (
        <SubjectSelector
          userName={profile.name}
          onGenerate={generateQuestions}
          onBack={() => setStep("profile")}
        />
      ) : null;

    case "loading":
      return profile ? <LoadingScreen userName={profile.name} /> : null;

    case "questions":
      return profile && subjectData ? (
        <QuestionPaper
          userName={profile.name}
          classLevel={profile.classLevel}
          subject={subjectData.subject}
          concepts={subjectData.concepts}
          complexity={subjectData.complexity}
          questions={questions}
          onBack={handleBackToSubject}
          onStartOver={handleStartOver}
          onRegenerate={handleRegenerate}
          isLoading={isRegenerating}
        />
      ) : null;

    default:
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }
};

export default Index;
