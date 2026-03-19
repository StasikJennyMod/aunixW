import { Model, ModelId, ApiKeys } from '../types';

export const AVAILABLE_MODELS: Model[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    icon: '✨',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    icon: '🌿',
    color: 'from-purple-500 to-pink-400',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    icon: '🌀',
    color: 'from-indigo-500 to-blue-400',
  },
  {
    id: 'grok-1',
    name: 'Grok',
    provider: 'grok',
    icon: '🤖',
    color: 'from-orange-500 to-red-400',
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek',
    provider: 'deepseek',
    icon: '🧠',
    color: 'from-green-500 to-emerald-400',
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'together',
    icon: '🦙',
    color: 'from-violet-500 to-purple-400',
  },
];

export const getModelById = (id: ModelId): Model => {
  return AVAILABLE_MODELS.find(m => m.id === id)!;
};

export async function streamFromAI(
  model: Model,
  messages: { role: string; content: string }[],
  apiKeys: ApiKeys,
  onChunk: (chunk: string) => void
): Promise<void> {
  const apiKey = apiKeys[model.provider];
  
  if (!apiKey) {
    throw new Error(`API ключ для ${model.provider} не настроен`);
  }

  const controllers: Record<string, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent',
    grok: 'https://api.x.ai/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    together: 'https://api.together.xyz/v1/chat/completions',
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: any;

  switch (model.provider) {
    case 'openai':
    case 'grok':
    case 'deepseek':
    case 'together':
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model: model.id,
        messages,
        stream: true,
        temperature: 0.7,
      };
      break;
      
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: 'claude-3-5-sonnet-20241022',
        messages,
        stream: true,
        max_tokens: 4096,
      };
      break;
      
    case 'gemini':
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?key=${apiKey}`;
      body = {
        contents: messages.map(m => ({
          parts: [{ text: m.content }],
          role: m.role === 'user' ? 'user' : 'model',
        })),
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                onChunk(data.candidates[0].content.parts[0].text);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      return;
  }

  const response = await fetch(controllers[model.provider], {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          let content = '';

          if (model.provider === 'openai' || model.provider === 'grok' || model.provider === 'deepseek' || model.provider === 'together') {
            content = parsed.choices[0]?.delta?.content || '';
          } else if (model.provider === 'anthropic') {
            content = parsed.delta?.text || '';
          }

          if (content) {
            onChunk(content);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }
          }
