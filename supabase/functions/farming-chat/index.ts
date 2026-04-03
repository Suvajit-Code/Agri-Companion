declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const SYSTEM_PROMPT = `You are KrishiAI, an expert Indian agricultural assistant. You help farmers with:
- Crop selection and recommendations based on soil, climate, and season
- Weather interpretation and farming advisories
- Market prices and selling strategies
- Pest and disease identification and organic/chemical solutions
- Fertilizer schedules and soil health management
- Irrigation techniques and water conservation
- Government schemes (PM-KISAN, crop insurance, MSP)
- Storage and post-harvest management

Guidelines:
- Be concise, practical, and actionable
- Use Indian units (acres, quintals, ₹) and reference Indian conditions
- Include both Hindi crop names and English names when relevant
- Suggest organic alternatives alongside chemical solutions
- Mention relevant government schemes when applicable
- Keep responses focused and farmer-friendly
- If unsure, say so rather than guessing`;

type IncomingContentPart =
  | { type?: string; text?: string }
  | { type?: string; image_url?: { url?: string } }
  | {
      type?: string;
      source?: {
        type?: string;
        media_type?: string;
        data?: string;
      };
    };

type IncomingMessage = {
  role?: string;
  content?: string | IncomingContentPart[];
};

function normalizeMessages(input: unknown): Array<{ role: "user" | "assistant" | "system"; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> }> {
  if (!Array.isArray(input)) return [];

  return input
    .map((message): { role: "user" | "assistant" | "system"; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> } | null => {
      const m = message as IncomingMessage;
      const role = m.role === "assistant" || m.role === "system" ? m.role : "user";

      if (typeof m.content === "string") {
        return { role, content: m.content };
      }

      if (!Array.isArray(m.content)) {
        return { role, content: "" };
      }

      const normalizedParts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];

      for (const part of m.content) {
        const p = part as IncomingContentPart;
        if (p.type === "text" && typeof p.text === "string" && p.text.trim()) {
          normalizedParts.push({ type: "text", text: p.text });
          continue;
        }

        if (p.type === "image_url" && typeof p.image_url?.url === "string" && p.image_url.url.trim()) {
          normalizedParts.push({ type: "image_url", image_url: { url: p.image_url.url } });
          continue;
        }

        if (p.type === "image" && p.source?.type === "base64" && typeof p.source?.data === "string" && p.source.data.trim()) {
          const mediaType = p.source.media_type || "image/jpeg";
          normalizedParts.push({
            type: "image_url",
            image_url: { url: `data:${mediaType};base64,${p.source.data}` },
          });
        }
      }

      if (normalizedParts.length === 0) {
        return { role, content: "" };
      }

      return { role, content: normalizedParts };
    })
    .filter((m): m is { role: "user" | "assistant" | "system"; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> } => {
      if (!m) return false;
      if (typeof m.content === "string") return m.content.trim().length > 0;
      return m.content.length > 0;
    });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { messages } = await req.json();
    const normalizedMessages = normalizeMessages(messages);

    if (normalizedMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid messages were provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const KRISHIGROW_API_KEY = Deno.env.get("KRISHIGROW_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    const KRISHIGROW_MODEL = Deno.env.get("KRISHIGROW_MODEL") || "google/gemini-2.5-flash";
    if (!KRISHIGROW_API_KEY) throw new Error("KRISHIGROW_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KRISHIGROW_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: KRISHIGROW_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...normalizedMessages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("farming-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
