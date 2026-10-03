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
      content: `### 🛡️ VYOMIX Logistics Intelligence AI Ready\n\nI am connected to the operational telemetry stream (Inventory, IMD Weather, Fleet Tracking, and Shortage Predictive Engine).\n\nSelect a logistics query or input your question below.`,
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
    } catch (e) {
      const errMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'Logistics intelligence engine temporarily offline. Please verify network status or retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-[#D8DFD5] rounded-xs shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#F0F4EE] border-b border-[#D8DFD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#355E3B] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tactical font-bold text-sm tracking-wider text-[#1F2933] uppercase">
                  VYOMIX ASSIST
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2F6B3C] border border-[#A5D6A7] font-mono text-[10px] font-bold">
                  GROUNDED AI
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#52606D]">
                Logistics & Forward Risk Copilot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xs text-[#52606D] hover:text-[#1F2933] hover:bg-[#E8EEE5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Context Bar */}
        <div className="px-4 py-2 bg-[#F7F8F4] border-b border-[#D8DFD5] flex items-center justify-between text-[11px] font-mono text-[#52606D]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#355E3B]" />
            CONTEXT: PUBLIC REGIONAL LOGISTICS NODES
          </span>
          <span className="text-[#2F6B3C] flex items-center gap-1 font-bold">
            <Terminal className="w-3 h-3" />
            SYNCHRONIZED
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F8F4]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono text-[#52606D]">
                <span>{msg.role === 'user' ? 'LOGISTICS OFFICER' : 'VYOMIX AI'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-xs text-xs leading-relaxed max-w-[92%] shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#355E3B] text-white border border-[#1F3D27]'
                    : 'bg-white border border-[#D8DFD5] text-[#1F2933]'
                }`}
              >
                <div 
                  className="space-y-2 whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/### (.*?)\n/g, '<h4 class="font-tactical font-bold text-[#355E3B] text-xs uppercase tracking-wider mb-2">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#1F2933]">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="text-[#6B7444] not-italic font-mono font-semibold">$1</em>')
                  }}
                />

                {msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#F0F4EE] flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#52606D] uppercase font-bold tracking-wider">
                      Sources:
                    </span>
                    {msg.sourcesUsed.map((src, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-[#F0F4EE] text-[#355E3B] rounded-xs border border-[#D8DFD5] font-mono text-[9px] font-semibold"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested quick follow-up prompts */}
              {msg.suggestedPrompts && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[92%]">
                  {msg.suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="px-2.5 py-1 rounded-xs bg-white hover:bg-[#E8EEE5] text-[#355E3B] border border-[#D8DFD5] hover:border-[#355E3B] font-mono text-[11px] font-semibold transition-colors flex items-center gap-1 text-left cursor-pointer shadow-xs"
                    >
                      <ChevronRight className="w-3 h-3 text-[#B5A47A]" />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-xs border border-[#D8DFD5] font-mono text-xs text-[#52606D] w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#355E3B] animate-ping" />
              <span>Analyzing logistics telemetry & synthesizing response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-white border-t border-[#D8DFD5]">
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
              placeholder="Ask about inventory buffers, weather risks, or transport status..."
              className="flex-1 bg-white border border-[#D8DFD5] focus:border-[#355E3B] px-3.5 py-2 text-xs font-mono text-[#1F2933] rounded-xs focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 bg-[#355E3B] hover:bg-[#1F3D27] disabled:opacity-50 text-white font-tactical text-xs font-bold uppercase rounded-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>SEND</span>
              <Send className="w-3 h-3 text-[#B5A47A]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
