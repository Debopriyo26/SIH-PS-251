import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Shield, Terminal, Sparkles, ChevronRight } from 'lucide-react';
import { assistantService } from '../../services/assistantService';
import { ChatMessage } from '../../types';

interface VyomixAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VyomixAssistModal: React.FC<VyomixAssistModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 🛡️ VYOMIX Tactical Logistics AI Ready\n\nI am connected to the live operational telemetry stream (Inventory, IMD Weather, Fleet Tracking, and Shortage Predictive Engine).\n\nSelect a tactical query or input your question below.`,
      timestamp: '05:45 IST',
      sourcesUsed: ['Inventory DB', 'IMD Mausam Gateway', 'Fleet Tracker'],
      suggestedPrompts: [
        'Which supplies are currently at risk?',
        'What is the projected fuel demand?',
        'Which locations have elevated weather risk?',
        "Show today's critical alerts.",
        'What changed since the last synchronization?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const response = await assistantService.query(textToSend);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-[#0C160F] border-l border-[#263F2B] flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-[#101B13] border-b border-[#263F2B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xs bg-[#263F2B] text-[#B5A47A] border border-[#596B3A]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tactical font-bold text-sm tracking-wider text-[#E7E9E2] uppercase">
                  VYOMIX ASSIST
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[rgba(63,163,77,0.15)] text-[#4ade80] border border-[#3fa34d]/40 font-mono text-[10px]">
                  GROUNDED AI
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#8B9B8E]">
                Autonomous Military Logistics & Forward Risk Copilot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xs text-[#8B9B8E] hover:text-[#E7E9E2] hover:bg-[#1A2C1E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Context Bar */}
        <div className="px-4 py-2 bg-[#07100B] border-b border-[#1A2C1E] flex items-center justify-between text-[11px] font-mono text-[#8B9B8E]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#B5A47A]" />
            CONTEXT: SECTOR LOGISTICS NODES
          </span>
          <span className="text-[#4ade80] flex items-center gap-1">
            <Terminal className="w-3 h-3" />
            SYNCHRONIZED
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono text-[#8B9B8E]">
                <span>{msg.role === 'user' ? 'TACTICAL OFFICER' : 'VYOMIX AI'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-sm text-xs leading-relaxed max-w-[92%] tactical-border ${
                  msg.role === 'user'
                    ? 'bg-[#263F2B] border-[#596B3A] text-[#E7E9E2]'
                    : 'bg-[#101B13] border-[#1A2C1E] text-[#E7E9E2]'
                }`}
              >
                <div 
                  className="space-y-2 whitespace-pre-line prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/### (.*?)\n/g, '<h4 class="font-tactical font-semibold text-[#B5A47A] text-xs uppercase tracking-wider mb-2">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="text-[#B5A47A] not-italic font-mono">$1</em>')
                  }}
                />

                {msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#1A2C1E] flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#8B9B8E] uppercase tracking-wider">
                      Sources:
                    </span>
                    {msg.sourcesUsed.map((src, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-[#07100B] text-[#B5A47A] rounded-xs border border-[#263F2B] font-mono text-[9px]"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested quick follow-up prompts */}
              {msg.suggestedPrompts && (
                <div className="mt-3 w-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-[#8B9B8E] uppercase tracking-wider px-1">
                    Quick Operational Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedPrompts.map((promptText, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(promptText)}
                        className="text-left px-2.5 py-1.5 rounded-xs bg-[#101B13] hover:bg-[#1A2C1E] border border-[#263F2B] hover:border-[#596B3A] text-xs font-mono text-[#E7E9E2] flex items-center gap-1.5 transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 text-[#B5A47A] shrink-0" />
                        <span>{promptText}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-[#101B13] border border-[#263F2B] rounded-sm text-xs font-mono text-[#8B9B8E] w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#B5A47A] animate-spin" />
              <span>Analyzing live telemetry and computing shortage probabilities...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#101B13] border-t border-[#263F2B]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask VYOMIX about supply risk, weather impact, transport..."
              className="flex-1 bg-[#07100B] border border-[#263F2B] focus:border-[#596B3A] focus:outline-hidden text-xs font-mono text-[#E7E9E2] px-3.5 py-2.5 rounded-xs placeholder:text-[#8B9B8E]/50"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-[#263F2B] hover:bg-[#325338] disabled:opacity-40 text-[#E7E9E2] border border-[#596B3A] rounded-xs transition-colors"
            >
              <Send className="w-4 h-4 text-[#B5A47A]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
