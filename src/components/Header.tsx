import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b border-white/10 bg-black/20 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="h-8 w-8 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text" />
          </motion.div>
          
          <div>
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "linear" 
              }}
              style={{ 
                backgroundSize: '200% auto',
              }}
            >
              aunixW
            </motion.h1>
            <p className="text-xs text-white/40">Winds of Intelligence</p>
          </div>
        </div>

        <motion.div 
          className="flex items-center gap-4 text-sm text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>Multi-AI</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>6 Models</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>One Flow</span>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
