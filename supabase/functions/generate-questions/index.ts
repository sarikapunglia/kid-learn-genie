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
    const { subject, concepts, age, classLevel, complexity } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const complexityGuidelines = {
      easy: `
- Use simple, straightforward language
- Questions should test basic understanding and recall
- Avoid complex scenarios or multi-step problems
- Focus on fundamental concepts
- Options should have clearly distinct answers`,
      medium: `
- Use moderately complex language appropriate for the grade level
- Include some application-based questions
- Mix of recall and understanding questions
- Some questions may require 2-step thinking
- Options should require careful reading to distinguish`,
      hard: `
- Use challenging, grade-appropriate language
- Include complex scenarios and multi-step problems
- Focus on analysis, application, and critical thinking
- Questions should test deep understanding
- Options should include plausible distractors that test nuanced understanding`,
    };

    const systemPrompt = `You are an expert educational content creator specializing in creating age-appropriate multiple choice questions for students.

Your task is to generate exactly 20 educational multiple choice questions based on the provided subject, topics/concepts, student age, class level, and complexity level.

COMPLEXITY LEVEL: ${complexity.toUpperCase()}
${complexityGuidelines[complexity as keyof typeof complexityGuidelines] || complexityGuidelines.medium}

Guidelines:
- Questions should be appropriate for a ${age}-year-old student in ${classLevel}
- Each question MUST have exactly 4 options (A, B, C, D)
- One or more options can be correct (indicate which ones)
- Cover all the concepts/topics mentioned
- For math questions, include actual numbers and problems to solve
- For science questions, ask about real phenomena and processes
- Each question should be self-contained and clear
- Make distractors (wrong options) plausible but clearly incorrect

Return ONLY a JSON array of exactly 20 question objects in this exact format:
[
  {
    "question": "What is 2 + 3?",
    "options": ["3", "4", "5", "6"],
    "correctAnswers": [2]
  }
]

The correctAnswers array contains 0-indexed positions of correct options (0=A, 1=B, 2=C, 3=D).
For questions with multiple correct answers, include all correct indices, e.g., [0, 2] means A and C are correct.`;

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
    interface QuestionItem {
      question: string;
      options: string[];
      correctAnswers: number[];
    }
    
    let questions: QuestionItem[];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
        // Validate and fix structure
        questions = questions.map((q, idx) => ({
          question: q.question || `Question ${idx + 1}`,
          options: Array.isArray(q.options) && q.options.length === 4 
            ? q.options 
            : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswers: Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0
            ? q.correctAnswers
            : [0]
        }));
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback: create basic questions
      questions = Array.from({ length: 20 }, (_, i) => ({
        question: `Practice question ${i + 1}: Explain what you learned about ${concepts}.`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswers: [0]
      }));
    }

    // Ensure we have exactly 20 questions
    while (questions.length < 20) {
      questions.push({
        question: `Practice question ${questions.length + 1}: Explain what you learned about ${concepts}.`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswers: [0]
      });
    }
    questions = questions.slice(0, 20);

    // Generate images for ~20% of questions (4 questions)
    const visualQuestionIndices: number[] = [];
    // Pick 4 questions spread across the paper for visual variety
    const candidates = questions
      .map((q, i) => ({ index: i, question: q.question }))
      .filter(q => {
        // Prefer questions about shapes, diagrams, patterns, graphs, maps, pictures, animals, plants, etc.
        const visualKeywords = /shape|diagram|graph|chart|map|picture|image|figure|draw|identify|observe|look|pattern|animal|plant|body|organ|planet|cell|circuit|flag|symbol|clock|fraction|geometry|triangle|circle|square|rectangle/i;
        return visualKeywords.test(q.question);
      });
    
    if (candidates.length >= 4) {
      // Pick 4 from visual candidates
      for (let i = 0; i < 4 && i < candidates.length; i++) {
        visualQuestionIndices.push(candidates[i].index);
      }
    } else {
      // Fill remaining slots with evenly spaced questions
      const alreadyPicked = new Set(candidates.map(c => c.index));
      for (const c of candidates) {
        visualQuestionIndices.push(c.index);
      }
      const step = Math.floor(20 / (4 - visualQuestionIndices.length + 1));
      for (let i = step; visualQuestionIndices.length < 4 && i < 20; i += step) {
        if (!alreadyPicked.has(i)) {
          visualQuestionIndices.push(i);
        }
      }
    }

    // Generate images in parallel for selected questions
    const imagePromises = visualQuestionIndices.map(async (qIndex) => {
      try {
        const q = questions[qIndex];
        const imagePrompt = `Create a simple, clean, colorful educational illustration for a ${classLevel} student (age ${age}) for this ${subject} question: "${q.question}". The image should be a helpful visual aid, diagram, or illustration that relates to the question. Use a white background, clear lines, and bright kid-friendly colors. Do NOT include any text or labels in the image.`;
        
        const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: imagePrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!imgResponse.ok) {
          console.error(`Image generation failed for question ${qIndex}:`, imgResponse.status);
          return { index: qIndex, imageUrl: null };
        }

        const imgData = await imgResponse.json();
        const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        return { index: qIndex, imageUrl: imageUrl || null };
      } catch (err) {
        console.error(`Image generation error for question ${qIndex}:`, err);
        return { index: qIndex, imageUrl: null };
      }
    });

    const imageResults = await Promise.all(imagePromises);
    
    // Attach images to questions
    const questionsWithImages = questions.map((q, i) => {
      const imgResult = imageResults.find(r => r.index === i);
      return {
        ...q,
        imageUrl: imgResult?.imageUrl || null,
      };
    });

    return new Response(JSON.stringify({ questions: questionsWithImages }), {
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
