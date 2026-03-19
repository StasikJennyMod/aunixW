import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore } from '../store/store';
import { AVAILABLE_MODELS } from '../lib/ai-providers';

const SettingsModal: React.FC = () => {
  const { isSettingsOpen, toggleSettings, apiKeys, setApiKey } = useStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const providers = Array.from(new Set(AVAILABLE_MODELS.map(m => m.provider)));

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSave = () => {
    toggleSettings();
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <Dialog open={isSettingsOpen} onOpenChange={toggleSettings}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                API Settings
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 py-4"
            >
              <p className="text-sm text-white/60">
                Enter your API keys for the AI providers. Keys are stored locally in your browser.
              </p>

              {providers.map((provider) => (
                <motion.div
                  key={provider}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {provider.charAt(0).toUpperCase() + provider.slice(1)} API Key
                  </label>
                  
                  <div className="relative">
                    <Input
                      type={showKeys[provider] ? 'text' : 'password'}
                      value={apiKeys[provider as keyof typeof apiKeys] || ''}
                      onChange={(e) => setApiKey(provider as any, e.target.value)}
                      className="bg-white/5 border-white/10 text-white pr-10"
                      placeholder={`sk-...`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showKeys[provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              ))}

              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Save Settings
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
