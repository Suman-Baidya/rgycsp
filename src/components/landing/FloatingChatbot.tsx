"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, User, BotMessageSquare } from "lucide-react";
import Link from "next/link";

interface FloatingChatbotProps {
  config?: any;
}

interface Message {
  id: string;
  role: "bot" | "user";
  content: string | React.ReactNode;
}

const QUICK_PROMPTS = [
  { label: "🎓 Courses", query: "Tell me about courses" },
  { label: "🏢 Franchise", query: "Franchise information" },
  { label: "📝 Admissions", query: "How to apply for admission?" },
  { label: "📞 Contact", query: "Contact support" },
];

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

  const handleSend = (textToSend?: string) => {
    const rawText = textToSend ?? input;
    if (!rawText.trim()) return;

    const userText = rawText.trim();
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInput("");

    // Simulate thinking delay
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let botResponse: React.ReactNode = "";

      // Rule-based logic
      if (lower.includes("course") || lower.includes("class") || lower.includes("program")) {
        botResponse = (
          <span>
            We offer a wide range of computer education courses! You can explore all our programs and syllabus{" "}
            <Link href="/courses" className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-2 hover:opacity-80">
              here
            </Link>.
          </span>
        );
      } else if (lower.includes("franchise") || lower.includes("branch") || lower.includes("center")) {
        botResponse = (
          <span>
            Interested in starting a franchise with us? Awesome! You can read our guidelines and apply directly{" "}
            <Link href="/franchises" className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-2 hover:opacity-80">
              on this page
            </Link>.
          </span>
        );
      } else if (lower.includes("admission") || lower.includes("apply") || lower.includes("join")) {
        botResponse = (
          <span>
            Ready to join? You can start your online admission process{" "}
            <Link href="/students" className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-2 hover:opacity-80">
              right here
            </Link>.
          </span>
        );
      } else if (lower.includes("contact") || lower.includes("support") || lower.includes("help") || lower.includes("phone")) {
        botResponse = (
          <span>
            Need human assistance? Visit our{" "}
            <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-2 hover:opacity-80">
              Contact Page
            </Link>{" "}
            for our phone numbers, email, and location.
          </span>
        );
      } else if (lower.includes("hello") || lower.includes("hi ") || lower === "hi") {
        botResponse = "Hello! How can I assist you today? Feel free to ask about courses, admissions, or franchise opportunities.";
      } else {
        botResponse = (
          <span>
            I&apos;m a quick-response bot, so I might not understand everything perfectly! Try asking about our <strong>courses</strong>, <strong>franchise</strong>, <strong>admissions</strong>, or <strong>contact</strong>.
          </span>
        );
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", content: botResponse }]);
    }, 500);
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
            className="fixed bottom-24 left-6 sm:left-8 z-[100] w-[calc(100vw-48px)] sm:w-[380px] h-[520px] max-h-[78vh] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative p-4 sm:p-5 flex items-center justify-between z-10 border-b border-indigo-500/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md">
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                  <BotMessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight tracking-wide">{chatbotName}</h3>
                  <p className="text-xs text-white/90 flex items-center gap-1.5 font-medium mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all backdrop-blur-sm relative z-10 cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth bg-slate-50/70 dark:bg-slate-950/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[88%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center shadow-sm text-white ${
                    msg.role === "user" 
                      ? "bg-slate-600 dark:bg-slate-700" 
                      : "bg-gradient-to-tr from-blue-600 to-indigo-600"
                  }`}>
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-xs shadow-sm" 
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-xs shadow-xs"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Quick suggestions when conversation is fresh */}
              {messages.length === 1 && (
                <div className="pt-2 space-y-1.5 pl-9">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Suggestions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(item.query)}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about courses, admissions..."
                  className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-full pl-4 pr-11 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="absolute right-1 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-full disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5 ml-[-1px]" />
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
            <div className="absolute inset-0 bg-indigo-500/30 dark:bg-indigo-500/40 rounded-full blur-xl animate-pulse scale-125 pointer-events-none" />
            
            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.7)] border border-white/20 transition-all duration-300 group cursor-pointer"
              aria-label="Open Chat Assistant"
            >
              <div className="relative">
                <BotMessageSquare className="w-7 h-7" />
                <Sparkles className="w-4 h-4 absolute -top-1.5 -right-2 text-yellow-300 animate-pulse drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-[72px] px-3.5 py-1.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-700/60 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                {chatbotName}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900/95 dark:border-r-slate-800/95" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
