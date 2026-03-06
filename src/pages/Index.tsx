import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    const topic = body?.topic || "General Knowledge";

    const questions = [
      `What is the meaning of ${topic}?`,
      `Explain the concept of ${topic}.`,
      `Why is ${topic} important?`,
      `Give an example related to ${topic}.`,
      `What are the key points of ${topic}?`
    ];

    return new Response(
      JSON.stringify({
        questions: questions
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to generate questions"
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  }
});
