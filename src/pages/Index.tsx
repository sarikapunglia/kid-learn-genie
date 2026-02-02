import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SubjectSelector from "@/components/SubjectSelector";
import QuestionPaper from "@/components/QuestionPaper";

type AppStep = "login" | "select" | "paper";

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

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setStep("select");
  };

  const handleGenerate = (data: QuestionData) => {
    setQuestionData(data);
    setStep("paper");
  };

  const handleBackToSelect = () => {
    setStep("select");
  };

  const handleStartOver = () => {
    setUserData(null);
    setQuestionData(null);
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

  if (step === "paper" && userData && questionData) {
    return (
      <QuestionPaper
        userName={userData.name}
        classLevel={userData.classLevel}
        subject={questionData.subject}
        concepts={questionData.concepts}
        onBack={handleBackToSelect}
        onStartOver={handleStartOver}
      />
    );
  }

  return null;
};

export default Index;
