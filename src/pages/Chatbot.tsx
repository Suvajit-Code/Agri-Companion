import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Leaf, CloudSun, TrendingUp, Bug, X, Upload, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaFile } from "@/components/MediaUpload";
import { MediaData } from "@/components/MediaGallery";

type Msg = { role: "user" | "assistant"; content: string; media?: MediaData[] };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const CHAT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/farming-chat` : "";
const USE_EDGE_FUNCTION = import.meta.env.VITE_USE_EDGE_FUNCTION === "true";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_VISION_MODEL = import.meta.env.VITE_GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

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
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [imageSendingStatus, setImageSendingStatus] = useState<string | null>(null);
  const [edgeFunctionHealthy, setEdgeFunctionHealthy] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close upload menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
        setShowUploadMenu(false);
      }
    }
    if (showUploadMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUploadMenu]);

  // Handle file selection from input
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const file = files[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      const preview = URL.createObjectURL(file);
      const type = file.type.startsWith("image/") ? "image" : "video";
      const media: MediaFile = {
        id: Date.now() + Math.random().toString(),
        file,
        preview,
        type,
      };
      setSelectedMedia((prev) => [...prev, media]);
      setShowUploadMenu(false);
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && selectedMedia.length === 0) return;
    if (isLoading) return;

    const outgoingMedia = [...selectedMedia];
    const hasImage = outgoingMedia.some((m) => m.type === "image");
    
    // Convert media files to data URLs and prepare for API
    const mediaData: MediaData[] = selectedMedia.map((m) => ({
      id: m.id,
      url: m.preview,
      type: m.type,
      name: m.file.name,
    }));

    const userMsg: Msg = { role: "user", content: text.trim() || "Analyzing image...", media: mediaData.length > 0 ? mediaData : undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedMedia([]);
    setIsLoading(true);
    setImageSendingStatus(mediaData.length > 0 ? "Analyzing image..." : null);

    try {
      const allMessages = [...messages, userMsg].filter((m) => m.content);
      let reply = "";

      // Build OpenAI-compatible multimodal messages. Only the latest outbound message
      // carries file objects, so encode those files directly before upload.
      const messagesForApi = await Promise.all(
        allMessages.map(async (m) => {
          let content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = m.content;

          if (m.role === "user" && m === userMsg && outgoingMedia.length > 0) {
            const parts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];

            if ((m.content || "").trim()) {
              parts.push({ type: "text", text: m.content });
            }

            for (const media of outgoingMedia) {
              if (media.type !== "image") continue;
              try {
                const dataUrl = await fileToDataUrl(media.file);
                if (dataUrl) {
                  parts.push({
                    type: "image_url",
                    image_url: { url: dataUrl },
                  });
                }
              } catch (error) {
                console.warn("Image encoding failed:", error);
              }
            }

            content = parts.length > 0 ? parts : m.content;
          }

          return {
            role: m.role,
            content,
          };
        })
      );

      // Primary path for production: Supabase Edge Function (text-only).
      // For image analysis we directly use vision fallback to avoid gateway incompatibility.
      const shouldTryEdge = !!(USE_EDGE_FUNCTION && CHAT_URL && SUPABASE_PUBLISHABLE_KEY && edgeFunctionHealthy && !hasImage);
      if (shouldTryEdge) {
        try {
          setImageSendingStatus("Sending to AI...");
          const edgeResp = await fetch(CHAT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ messages: messagesForApi }),
          });

          if (edgeResp.ok && edgeResp.body && edgeResp.headers.get("content-type")?.includes("text/event-stream")) {
            setImageSendingStatus("Processing...");
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
            if (edgeResp.status >= 500) {
              setEdgeFunctionHealthy(false);
            }
            throw new Error(edgeErr.error || "Supabase chat function failed");
          }
        } catch (edgeError) {
          setEdgeFunctionHealthy(false);
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

        setImageSendingStatus(hasImage ? "Analyzing image with AI..." : "Analyzing with AI...");
        const response = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: hasImage ? GROQ_VISION_MODEL : GROQ_MODEL,
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

When analyzing images:
- Identify crops, plants, pests, diseases, or soil conditions
- Provide specific recommendations based on what you see
- Suggest immediate actions if there's an issue
- Be practical and actionable

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

        setImageSendingStatus(null);
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

      setImageSendingStatus(null);
      if (!reply) {
        reply = "I apologize, I couldn't process that. Please try again.";
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      console.error("Chat error:", e);
      setImageSendingStatus(null);
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}. Please try again.` }]);
    } finally {
      setIsLoading(false);
      setImageSendingStatus(null);
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
              {/* Image Preview - Compact inline display */}
              {msg.media && msg.media.length > 0 && (
                <div className={`flex gap-2 flex-wrap ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.media.map((media) => (
                    <div key={media.id} className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                      {media.type === "image" ? (
                        <img 
                          src={media.url} 
                          alt={media.name || "Image"} 
                          className="max-w-[200px] max-h-[200px] object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-muted flex items-center justify-center">
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Message Text */}
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

        {/* Loading State with Subtle Indicator */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  {imageSendingStatus || "Thinking..."}
                </span>
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

      {/* Selected Media Preview */}
      {selectedMedia.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 flex-wrap mb-3"
        >
          {selectedMedia.map((m) => (
            <div key={m.id} className="relative rounded-lg overflow-hidden bg-muted border border-border group w-20 h-20 flex-shrink-0">
              {m.type === "image" ? (
                <img src={m.preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <span className="text-xs text-white font-medium">Video</span>
                </div>
              )}
              <button
                onClick={() => {
                  const updated = selectedMedia.filter((x) => x.id !== m.id);
                  setSelectedMedia(updated);
                  URL.revokeObjectURL(m.preview);
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-100 hover:scale-110 transition-transform"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        {/* Upload Menu */}
        <div className="relative" ref={uploadMenuRef}>
          <Button
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-muted"
            disabled={isLoading}
          >
            <Plus className="w-5 h-5 text-primary" />
          </Button>

          {/* Upload/Camera Menu */}
          {showUploadMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute bottom-12 left-0 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowUploadMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Upload className="w-4 h-4 text-primary" />
                <span>Upload Image</span>
              </button>
              <div className="border-t border-border" />
              <button
                onClick={() => {
                  cameraInputRef.current?.click();
                  setShowUploadMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Camera className="w-4 h-4 text-primary" />
                <span>Use Camera</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* File Inputs (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask me anything... or upload an image"
          className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary/30 transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          disabled={isLoading}
        />

        {/* Send Button */}
        <Button
          onClick={() => sendMessage(input)}
          disabled={isLoading || (!input.trim() && selectedMedia.length === 0)}
          className="gradient-hero text-primary-foreground border-0 hover:opacity-90 rounded-xl px-4 h-10"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
