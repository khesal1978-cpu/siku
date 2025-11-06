import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Send, Smile } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function HelpCenter() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hi! I'm the PingCaset assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickReplies = [
    'Withdrawal Issues',
    'How to Start Mining',
    'Account Security'
  ];

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Thank you for your message. Our support team will get back to you shortly with more information about your query.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-screen bg-[#f6f8f7] dark:bg-[#10221a] flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-10 shrink-0 bg-[#f6f8f7]/80 dark:bg-[#10221a]/80 backdrop-blur-md border-b border-[#e0e2e1]/80 dark:border-[#2c3e35]/50">
        <div className="flex items-center justify-between p-4 pb-3">
          <Link href="/profile" data-testid="link-back">
            <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" data-testid="button-back">
              <ArrowLeft className="w-6 h-6 text-[#111815] dark:text-[#e0e2e1]" />
            </button>
          </Link>
          <h1 className="flex-1 text-center text-lg font-bold text-[#111815] dark:text-white">Help Center</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
        <div className="flex flex-col gap-5">
          {messages.map((message, index) => (
            <div key={message.id}>
              {message.sender === 'bot' ? (
                <div className="flex items-end gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary shadow-lg shrink-0">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start gap-2 flex-1">
                    <p className="text-xs font-medium text-[#618979] dark:text-[#a0a3a1]">PingCaset Assistant</p>
                    <div className="max-w-[80%]">
                      <p className="shadow-sm rounded-b-2xl rounded-tr-2xl bg-white dark:bg-[#1a2c23] px-4 py-3 text-sm leading-relaxed text-[#111815] dark:text-[#e0e2e1]">
                        {message.text}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-end justify-end gap-3">
                  <div className="flex max-w-[80%] flex-col items-end gap-2">
                    <p className="shadow-md shadow-primary/30 rounded-b-2xl rounded-tl-2xl bg-primary px-4 py-3 text-sm leading-relaxed text-[#111815]">
                      {message.text}
                    </p>
                  </div>
                </div>
              )}

              {index === 0 && message.sender === 'bot' && (
                <div className="flex flex-wrap gap-2 py-1 pl-12 mt-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleSendMessage(reply)}
                      className="flex h-8 items-center justify-center rounded-full border border-[#e0e2e1]/80 dark:border-[#2c3e35]/50 bg-white dark:bg-[#1a2c23] px-4 text-xs font-medium text-[#111815] dark:text-[#e0e2e1] hover:bg-[#f6f8f7] dark:hover:bg-[#2c3e35]/60 transition-colors"
                      data-testid={`button-quick-${reply.toLowerCase().replace(/ /g, '-')}`}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary shadow-lg shrink-0">
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex flex-col items-start gap-2 flex-1">
                <p className="text-xs font-medium text-[#618979] dark:text-[#a0a3a1]">PingCaset Assistant</p>
                <div className="max-w-[80%]">
                  <div className="shadow-sm flex items-center gap-2 rounded-b-2xl rounded-tr-2xl bg-white dark:bg-[#1a2c23] px-4 py-3.5">
                    <span className="w-1.5 h-1.5 animate-pulse rounded-full bg-primary/70" style={{animationDelay: '-0.3s'}} />
                    <span className="w-1.5 h-1.5 animate-pulse rounded-full bg-primary/70" style={{animationDelay: '-0.15s'}} />
                    <span className="w-1.5 h-1.5 animate-pulse rounded-full bg-primary/70" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 mt-auto shrink-0 bg-[#f6f8f7] dark:bg-[#10221a] shadow-lg">
        <div className="flex items-center gap-3 p-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full rounded-full border-transparent bg-white dark:bg-[#1a2c23] py-3 pl-5 pr-12 text-sm text-[#111815] dark:text-[#e0e2e1] ring-1 ring-[#e0e2e1]/80 dark:ring-[#2c3e35]/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder:text-[#618979] dark:placeholder:text-[#a0a3a1]"
              placeholder="Type your message..."
              data-testid="input-message"
            />
            <button className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#618979] dark:text-[#a0a3a1] hover:text-primary dark:hover:text-primary" data-testid="button-emoji-picker">
              <Smile className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={() => handleSendMessage()}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-[#111815] shadow-lg shadow-primary/30 active:scale-95 transition-transform"
            data-testid="button-send"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}
