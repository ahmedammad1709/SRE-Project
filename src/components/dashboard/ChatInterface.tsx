import { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@/contexts/ConversationContext";

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  projectId: number;
  projectName: string;
}

export function ChatInterface({ projectId, projectName }: ChatInterfaceProps) {
  const { toast } = useToast();
  const { setProjectId } = useConversation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set project ID in context
  useEffect(() => {
    setProjectId(projectId);
  }, [projectId, setProjectId]);

  // Gemini API configuration
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoadingHistory(true);
        const res = await fetch(`/api/chat?projectId=${projectId}`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setMessages(data.data);
        } else {
          // Initialize with welcome message if no history
          const welcomeMessage: Message = {
            id: Date.now(),
            role: "bot",
            content: `Hello! I'm here to help you gather requirements for "${projectName}". Let's start by understanding what you're building. Can you tell me about your project and what problem it aims to solve?`,
            created_at: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        // Initialize with welcome message on error
        const welcomeMessage: Message = {
          id: Date.now(),
          role: "bot",
          content: `Hello! I'm here to help you gather requirements for "${projectName}". Let's start by understanding what you're building. Can you tell me about your project and what problem it aims to solve?`,
          created_at: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (projectId) {
      loadHistory();
    }
  }, [projectId, projectName]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.",
        variant: "destructive",
      });
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Build conversation history for Gemini
    const historyForGemini = messages.map((msg) => ({
      role: msg.role === "bot" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // Step 1: Save user message to backend
      const saveUserRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          role: "user",
          content: userMessage,
        }),
      });

      const saveUserData = await saveUserRes.json();
      if (!saveUserData.success) {
        throw new Error(saveUserData.error || "Failed to save user message");
      }

      const savedUserMessage = saveUserData.data;

      // Step 2: Get Gemini response using conversational API
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          role: "conversation",
          content: userMessage,
          conversationHistory: historyForGemini,
          projectName,
        }),
      });

      const chatData = await chatRes.json();
      if (!chatData.success) {
        throw new Error(chatData.error || "Failed to get response");
      }

      const botResponseText = chatData.response || "I apologize, but I couldn't generate a response. Please try again.";

      // Step 3: Save bot response to backend
      const saveBotRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          role: "bot",
          content: botResponseText,
        }),
      });

      const saveBotData = await saveBotRes.json();
      if (!saveBotData.success) {
        throw new Error(saveBotData.error || "Failed to save bot message");
      }

      const savedBotMessage = saveBotData.data;

      // Step 4: Update UI with both messages
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMessage.id);
        return [...filtered, savedUserMessage, savedBotMessage];
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Could not send your message.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-card border border-border rounded-xl overflow-hidden">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading chat history...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">Start the conversation</h3>
              <p className="text-sm text-muted-foreground">
                I'm here to help you gather requirements for "{projectName}". Ask me anything about your project!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "bot" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="shrink-0"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
