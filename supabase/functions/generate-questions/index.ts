export default async function handler(req: Request) {
  return new Response(
    JSON.stringify({
      message: "AI temporarily disabled"
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200
    }
  );
}
