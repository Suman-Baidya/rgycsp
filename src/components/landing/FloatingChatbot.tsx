"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, X, Send, Sparkles, User, MessageCircle, Brain, BotMessageSquare } from "lucide-react";
import Link from "next/link";

interface FloatingChatbotProps {
  config?: any;
}

interface Message {
  id: string;
  role: "bot" | "user";
  content: string | React.ReactNode;
}

export function FloatingChatbot({ config }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const enableChatbot = config?.enableChatbot !== false; // default true
  const chatbotName = config?.chatbotName || "AI Assistant";
  const welcomeMessage = config?.welcomeMessage || "Hi there! How can I help you today?";

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: "1", role: "bot", content: welcomeMessage }]);
    }
  }, [welcomeMessage, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!enableChatbot) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    // Simulate thinking delay
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let botResponse: React.ReactNode = "";

      // Rule-based logic
      if (lower.includes("course") || lower.includes("class") || lower.includes("program")) {
        botResponse = (
          <span>
            We offer a wide range of computer education courses! You can explore all our programs and syllabus <Link href="/courses" className="text-primary underline font-bold">here</Link>.
          </span>
        );
      } else if (lower.includes("franchise") || lower.includes("branch") || lower.includes("center")) {
        botResponse = (
          <span>
            Interested in starting a franchise with us? Awesome! You can read our guidelines and apply directly <Link href="/franchises" className="text-primary underline font-bold">on this page</Link>.
          </span>
        );
      } else if (lower.includes("admission") || lower.includes("apply") || lower.includes("join")) {
        botResponse = (
          <span>
            Ready to join? You can start your online admission process <Link href="/students" className="text-primary underline font-bold">right here</Link>.
          </span>
        );
      } else if (lower.includes("contact") || lower.includes("support") || lower.includes("help") || lower.includes("phone")) {
        botResponse = (
          <span>
            Need human assistance? Visit our <Link href="/contact" className="text-primary underline font-bold">Contact Page</Link> for our phone numbers, email, and location.
          </span>
        );
      } else if (lower.includes("hello") || lower.includes("hi ") || lower === "hi") {
        botResponse = "Hello! How can I assist you today?";
      } else {
        botResponse = (
          <span>
            I'm a quick-response bot, so I might not understand everything perfectly! Try asking about our <strong>courses</strong>, <strong>franchise</strong>, <strong>admissions</strong>, or <strong>contact</strong>.
          </span>
        );
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", content: botResponse }]);
    }, 600);
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-6 sm:left-8 z-[100] w-[calc(100vw-48px)] sm:w-[380px] h-[500px] max-h-[75vh] bg-background/80 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[32px] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative p-5 flex items-center justify-between z-10 border-b border-white/10 bg-gradient-to-r from-primary/90 via-primary to-indigo-600/90 shadow-lg">
              {/* Decorative background for header */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <BotMessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg leading-tight tracking-wide">{chatbotName}</h3>
                  <p className="text-xs text-white/90 flex items-center gap-1.5 font-medium mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-all backdrop-blur-sm relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-gradient-to-b from-transparent to-muted/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[88%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center shadow-md ${
                    msg.role === "user" ? "bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200" : "bg-gradient-to-tr from-primary to-indigo-500 text-white"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-sm" 
                      : "bg-white dark:bg-slate-900 border border-border/50 text-foreground rounded-tl-sm shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)]"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/50 backdrop-blur-sm border-t border-white/10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full bg-white dark:bg-slate-950 border border-border/60 rounded-full pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/30"
                >
                  <Send className="w-4 h-4 ml-[-2px]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className={`fixed ${config?.enableWhatsApp !== false ? "bottom-[90px] sm:bottom-[104px]" : "bottom-6 sm:bottom-8"} left-6 sm:left-8 z-[90]`}
          >
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse scale-150 pointer-events-none" />
            
            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary via-primary to-indigo-600 text-white rounded-full shadow-[0_15px_30px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] border border-white/20 transition-all duration-300 group"
              aria-label="Open Chat Assistant"
            >
              <div className="relative">
                <BotMessageSquare className="w-7 h-7" />
                <Sparkles className="w-4 h-4 absolute -top-1.5 -right-2 text-yellow-300 animate-pulse drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]" />
              </div>
              
              {/* Premium Tooltip */}
              <div className="absolute left-[76px] px-4 py-2 bg-slate-900/90 backdrop-blur-sm border border-white/10 text-white text-xs font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                {chatbotName}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900/90" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
