import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, AlertCircle } from 'lucide-react';
import { ChatColumn } from '../types';
import { AVAILABLE_MODELS } from '../lib/ai-providers';
import { useStore } from '../store/store';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cn } from '../lib/utils';
import TypingAnimation from './TypingAnimation';

interface AnswerColumnProps {
  column: ChatColumn;
}

const AnswerColumn: React.FC<AnswerColumnProps> = ({ column }) => {
  const { removeColumn, clearColumn, updateColumnModel } = useStore();
  const model = AVAILABLE_MODELS.find(m => m.id === column.modelId)!;

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateColumnModel(column.id, e.target.value as any);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, type: 'spring' }}
      className="h-full"
    >
      <Card className="h-full bg-black/40 backdrop-blur-xl border-white/10 overflow-hidden flex flex-col relative group">
        {/* Gradient glow effect */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
            `bg-gradient-to-br ${model.color}`
          )}
          style={{
            filter: 'blur(80px)',
            transform: 'translateZ(0)',
          }}
        />
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{model.icon}</span>
            <div>
              <select
                value={column.modelId}
                onChange={handleModelChange}
                className="bg-transparent text-white font-semibold text-lg outline-none cursor-pointer hover:text-white/80 transition-colors"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-gray-900">
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-white/40">{model.provider}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => clearColumn(column.id)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => removeColumn(column.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {column.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-3 rounded-lg backdrop-blur-sm',
                message.role === 'user'
                  ? 'bg-blue-500/10 border border-blue-500/20 ml-auto max-w-[80%]'
                  : 'bg-white/5 border border-white/10 mr-auto max-w-[80%]'
              )}
            >
              {message.role === 'assistant' && message.isStreaming ? (
                <TypingAnimation text={message.content} />
              ) : (
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              )}
            </motion.div>
          ))}
          
          {column.isLoading && !column.messages.some(m => m.isStreaming) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-white/40"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150" />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-300" />
            </motion.div>
          )}

          {column.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{column.error}</p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default AnswerColumn;
