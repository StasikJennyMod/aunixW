import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useStore } from '../store/store';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addColumn, columns, toggleSettings } = useStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canAddColumn = columns.length < 6;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-white/10 bg-black/40 backdrop-blur-xl p-4"
    >
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask all AI models simultaneously..."
                className="min-h-[60px] max-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none pr-24"
                disabled={isLoading}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  disabled={!message.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              {canAddColumn && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-[60px] w-[60px] border-white/10 hover:bg-white/5"
                  onClick={() => addColumn('gpt-4o')}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-[60px] w-[60px] border-white/10 hover:bg-white/5"
                onClick={toggleSettings}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatInput;
