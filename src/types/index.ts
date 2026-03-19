export type ModelId = 
  | 'gpt-4o'
  | 'claude-3.5-sonnet'
  | 'gemini-1.5-pro'
  | 'grok-1'
  | 'deepseek-chat'
  | 'llama-3.1-405b';

export interface Model {
  id: ModelId;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'grok' | 'deepseek' | 'together';
  icon: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelId?: ModelId;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatColumn {
  id: string;
  modelId: ModelId;
  messages: Message[];
  isLoading: boolean;
  error?: string;
}

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  grok?: string;
  deepseek?: string;
  together?: string;
}

export interface AppState {
  columns: ChatColumn[];
  apiKeys: ApiKeys;
  isSettingsOpen: boolean;
  addColumn: (modelId: ModelId) => void;
  removeColumn: (columnId: string) => void;
  updateColumnModel: (columnId: string, modelId: ModelId) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  sendMessage: (message: string) => Promise<void>;
  clearColumn: (columnId: string) => void;
  toggleSettings: () => void;
}
