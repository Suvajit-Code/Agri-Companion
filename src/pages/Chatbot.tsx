import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, Leaf, CloudSun, TrendingUp, Bug, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaUpload, MediaFile } from "@/components/MediaUpload";
import { MediaGallery, MediaData } from "@/components/MediaGallery";

type Msg = { role: "user" | "assistant"; content: string; media?: MediaData[] };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const CHAT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/farming-chat` : "";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";

const quickReplies = [
  { label: "Best Rabi crops?", icon: Leaf },
  { label: "Weather forecast for wheat", icon: CloudSun },
  { label: "Current tomato prices", icon: TrendingUp },
  { label: "Pest control for rice", icon: Bug },
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Namaste! 🙏 I'm your AI farming assistant. Ask me anything about crops, weather, soil, prices, or farming techniques. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Convert media files to data URLs
    const mediaData: MediaData[] = selectedMedia.map((m) => ({
      id: m.id,
      url: m.preview,
      type: m.type,
      name: m.file.name,
    }));

    const userMsg: Msg = { role: "user", content: text.trim(), media: mediaData.length > 0 ? mediaData : undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedMedia([]);
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg].filter((m) => m.content);

      let reply = "";

      // Primary path for production: Supabase Edge Function
      if (CHAT_URL && SUPABASE_PUBLISHABLE_KEY) {
        try {
          const edgeResp = await fetch(CHAT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ messages: allMessages }),
          });

          if (edgeResp.ok && edgeResp.body && edgeResp.headers.get("content-type")?.includes("text/event-stream")) {
            const reader = edgeResp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              let newlineIndex: number;
              while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
                let line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 1);
                if (line.endsWith("\r")) line = line.slice(0, -1);
                if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;
                const jsonStr = line.slice(6).trim();
                if (jsonStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
                  if (chunk) reply += chunk;
                } catch {
                  // Ignore malformed stream chunk and continue.
                }
              }
            }
          } else if (edgeResp.ok) {
            const data = await edgeResp.json().catch(() => ({}));
            reply = data.choices?.[0]?.message?.content || data.message || "";
          } else {
            const edgeErr = await edgeResp.json().catch(() => ({}));
            throw new Error(edgeErr.error || "Supabase chat function failed");
          }
        } catch (edgeError) {
          if (!GROQ_API_KEY) {
            throw edgeError;
          }
        }
      }

      // Fallback path: direct Groq
      if (!reply) {
        if (!GROQ_API_KEY) {
          throw new Error(
            "AI is not configured. Set Supabase function credentials or add VITE_GROQ_API_KEY in Vercel Environment Variables."
          );
        }

        const messagesForApi = allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              {
                role: "system",
                content: `You are KrishiAI, an expert Indian agricultural assistant. You help farmers with:
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
- If unsure, say so rather than guessing`,
              },
              ...messagesForApi,
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const apiMessage = errData.error?.message || "Failed to get response from AI";

          if (typeof apiMessage === "string" && apiMessage.toLowerCase().includes("decommissioned")) {
            throw new Error(
              "The selected Groq model is deprecated. Update VITE_GROQ_MODEL to a currently supported model and restart the app."
            );
          }

          throw new Error(apiMessage);
        }

        const data = await response.json();
        reply = data.choices?.[0]?.message?.content || "";
      }

      if (!reply) {
        reply = "I apologize, I couldn't process that. Please try again.";
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      console.error("Chat error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}. Please try again.` }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-heading font-bold text-foreground">KrishiAI Assistant</h1>
          <p className="text-xs text-muted-foreground">Powered by AI • Ask anything about farming</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "gradient-warm" : "gradient-hero"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4 text-secondary-foreground" /> : <Bot className="w-4 h-4 text-primary-foreground" />}
            </div>
            <div className={`max-w-[75%] space-y-2 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
              {msg.media && msg.media.length > 0 && (
                <div className="max-w-[75%]">
                  <MediaGallery media={msg.media} />
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "glass-card text-foreground rounded-bl-md"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length <= 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {quickReplies.map((q) => (
            <button
              key={q.label}
              onClick={() => sendMessage(q.label)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card text-xs text-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <q.icon className="w-3 h-3 text-primary" />
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="space-y-2">
        {selectedMedia.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedMedia.map((m) => (
              <div key={m.id} className="relative rounded-lg overflow-hidden bg-muted border border-border group w-16 h-16">
                {m.type === "image" ? (
                  <img src={m.preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <span className="text-xs text-white">Video</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    const updated = selectedMedia.filter((x) => x.id !== m.id);
                    setSelectedMedia(updated);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <MediaUpload onMediaSelect={setSelectedMedia} selectedMedia={selectedMedia} maxFiles={5} />
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about crops, weather, prices... You can also upload images or videos"
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="gradient-hero text-primary-foreground border-0 hover:opacity-90 rounded-xl px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
