import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatBubbleProps {
  className?: string;
}

export function ChatBubble({ className = '' }: ChatBubbleProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hide on the chat page
  if (location.pathname === '/chat') return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');

    // Mock assistant response
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm processing your request. This will be connected to the full chat engine soon.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4 ${className}`}>
      {/* Chat Panel */}
      <div
        className={`w-[380px] bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_48px_-8px_rgba(25,28,29,0.15)] border border-outline-variant overflow-hidden transition-all duration-300 origin-bottom-right ${
          open
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-90 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary-container text-on-primary">
          <div className="flex items-center gap-3">
            <span className="icon text-xl">auto_awesome</span>
            <div>
              <p className="font-heading font-bold text-sm leading-tight">Querai Assistant</p>
              <p className="text-[10px] opacity-70">Ready to assist</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="icon text-lg">remove</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setMessages([
                  {
                    id: '1',
                    role: 'assistant',
                    content: 'Hi! How can I help you today?',
                    timestamp: new Date(),
                  },
                ]);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="icon text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto px-4 py-4 space-y-3 sidebar-scroll">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-container text-on-primary rounded-2xl rounded-br-md'
                    : 'bg-surface-container-high/60 text-on-surface rounded-2xl rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-outline-variant/10">
          <div className="flex items-center gap-2 bg-surface-container-high/40 rounded-xl px-3 py-2 focus-within:bg-surface-container-high/60 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface placeholder-outline font-sans"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors disabled:opacity-30"
            >
              <span className="icon text-base">send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bubble Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 flex items-center justify-center rounded-full shadow-[0_8px_30px_-4px_rgba(26,77,46,0.3)] hover:shadow-[0_12px_40px_-4px_rgba(26,77,46,0.4)] transition-all duration-300 active:scale-95 ${
          open
            ? 'bg-primary text-on-primary'
            : 'bg-primary-container text-on-primary hover:bg-primary'
        }`}
      >
        <span className={`icon text-2xl transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          {open ? 'keyboard_arrow_down' : 'auto_awesome'}
        </span>
      </button>
    </div>
  );
}

export default ChatBubble;
