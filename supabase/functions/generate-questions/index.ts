import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, concepts, age, classLevel } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert educational content creator specializing in creating age-appropriate questions for students.

Your task is to generate exactly 20 educational questions based on the provided subject, topics/concepts, student age, and class level.

Guidelines:
- Questions should be appropriate for a ${age}-year-old student in ${classLevel}
- Mix different question types: multiple choice concepts, short answer, fill in the blanks, true/false, and problem-solving
- Questions should progress from easier to more challenging
- Use clear, simple language appropriate for the student's age
- Make questions engaging and interesting for kids
- Cover all the concepts/topics mentioned by the student
- For math questions, include actual numbers and problems to solve
- For science questions, ask about real phenomena and processes
- Each question should be self-contained and clear

Return ONLY a JSON array of exactly 20 question strings. No explanations, no numbering, just the JSON array.
Example format: ["What is 2 + 3?", "Name the three states of matter.", ...]`;

    const userPrompt = `Generate 20 educational questions for:
Subject: ${subject}
Topics/Concepts to cover: ${concepts}
Student Age: ${age} years old
Class Level: ${classLevel}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate questions. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse the JSON array from the response
    let questions: string[];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback: split by newlines if JSON parsing fails
      questions = content
        .split(/\n/)
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((line: string) => line.length > 0)
        .slice(0, 20);
    }

    // Ensure we have exactly 20 questions
    while (questions.length < 20) {
      questions.push(`Practice question ${questions.length + 1}: Explain what you learned about ${concepts}.`);
    }
    questions = questions.slice(0, 20);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
