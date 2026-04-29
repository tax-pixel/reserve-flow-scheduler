import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { createConversation, createAgentChat } from '@/lib/agent-chat/v2';
import { isToolUIPart } from 'ai';
import type { UIMessage } from 'ai';
import { ulid } from 'ulidx';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const AGENT_ID = '01KQDBHHXH52SRX6MXRQX39W66';

function ActiveChat({ chat }: { chat: ReturnType<typeof createAgentChat> }) {
  const { messages, status, addToolApprovalResponse } = useChat({ chat, id: chat.id });
  const isSending = status === 'submitted' || status === 'streaming';
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    await chat.sendMessage({
      id: ulid(),
      role: 'user',
      parts: [{ type: 'text', text }],
    });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg: UIMessage) => (
          <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role !== 'user' && (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted rounded-tl-sm'
              )}
            >
              {msg.parts.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <div key={i} className="prose prose-sm dark:prose-invert max-w-none text-inherit">
                      <ReactMarkdown>{part.text}</ReactMarkdown>
                    </div>
                  );
                }
                if (isToolUIPart(part)) {
                  return (
                    <div key={i} className="text-xs text-muted-foreground italic">
                      {part.state === 'approval-requested' && part.approval != null ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span>Approve tool: {part.toolName}?</span>
                          <button
                            onClick={() => addToolApprovalResponse({ id: part.approval!.id, approved: true })}
                            className="px-2 py-0.5 bg-emerald-500 text-white rounded text-xs"
                          >Yes</button>
                          <button
                            onClick={() => addToolApprovalResponse({ id: part.approval!.id, approved: false })}
                            className="px-2 py-0.5 bg-red-500 text-white rounded text-xs"
                          >No</button>
                        </div>
                      ) : (
                        <span>Using {part.toolName}...</span>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything about your upload week..."
            rows={1}
            className="flex-1 px-3 py-2 bg-background border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

const AgentChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<ReturnType<typeof createAgentChat> | null>(null);
  const [initializing, setInitializing] = useState(false);

  const initChat = async () => {
    if (chat) return;
    setInitializing(true);
    try {
      const { conversationId } = await createConversation(AGENT_ID);
      setChat(createAgentChat(AGENT_ID, conversationId));
    } catch (e) {
      console.error('Failed to init chat', e);
    } finally {
      setInitializing(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    initChat();
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center transition-all',
          open && 'hidden'
        )}
        aria-label="Open tax assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[520px] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Tax Upload Assistant</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
              {initializing ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Starting conversation...</p>
                  </div>
                </div>
              ) : chat ? (
                <div className="h-full flex flex-col">
                  <ActiveChat chat={chat} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  <p>Unable to connect. Please try again.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgentChat;
