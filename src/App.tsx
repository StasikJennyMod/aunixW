import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import AnswerColumn from './components/AnswerColumn';
import SettingsModal from './components/SettingsModal';
import { useStore } from './store/store';

function App() {
  const { columns, sendMessage } = useStore();
  const isLoading = columns.some(col => col.isLoading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950/30 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        <main className="flex-1 overflow-hidden p-4">
          <motion.div 
            className="h-full grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            }}
          >
            <AnimatePresence mode="popLayout">
              {columns.map((column) => (
                <AnswerColumn key={column.id} column={column} />
              ))}
            </AnimatePresence>
          </motion.div>
        </main>

        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        <SettingsModal />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;
