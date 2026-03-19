import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, ChatColumn, Message, ModelId, ApiKeys } from '../types';
import { streamFromAI, getModelById, AVAILABLE_MODELS } from '../lib/ai-providers';
import { toast } from 'sonner';

const INITIAL_COLUMNS: ChatColumn[] = [
  {
    id: '1',
    modelId: 'gpt-4o',
    messages: [],
    isLoading: false,
  },
  {
    id: '2',
    modelId: 'claude-3.5-sonnet',
    messages: [],
    isLoading: false,
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      columns: INITIAL_COLUMNS,
      apiKeys: {},
      isSettingsOpen: false,

      addColumn: (modelId: ModelId) => {
        set((state) => ({
          columns: [
            ...state.columns,
            {
              id: Date.now().toString(),
              modelId,
              messages: [],
              isLoading: false,
            },
          ],
        }));
        toast.success('Колонка добавлена');
      },

      removeColumn: (columnId: string) => {
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== columnId),
        }));
        toast.success('Колонка удалена');
      },

      updateColumnModel: (columnId: string, modelId: ModelId) => {
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, modelId, messages: [], error: undefined } : col
          ),
        }));
      },

      setApiKey: (provider: keyof ApiKeys, key: string) => {
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        }));
        toast.success(`Ключ для ${provider} сохранен`);
      },

      clearColumn: (columnId: string) => {
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, messages: [], error: undefined } : col
          ),
        }));
      },

      toggleSettings: () => {
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen }));
      },

      sendMessage: async (content: string) => {
        const { columns, apiKeys } = get();
        
        // Add user message to all columns
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        set({
          columns: columns.map((col) => ({
            ...col,
            messages: [...col.messages, userMessage],
            isLoading: true,
            error: undefined,
          })),
        });

        // Stream responses from each model
        const promises = columns.map(async (column) => {
          const model = getModelById(column.modelId);
          const columnId = column.id;
          
          try {
            const assistantMessageId = (Date.now() + 1).toString();
            
            // Add empty assistant message for streaming
            set((state) => ({
              columns: state.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      messages: [
                        ...col.messages,
                        {
                          id: assistantMessageId,
                          role: 'assistant',
                          content: '',
                          modelId: column.modelId,
                          timestamp: Date.now(),
                          isStreaming: true,
                        },
                      ],
                    }
                  : col
              ),
            }));

            let accumulatedContent = '';

            await streamFromAI(
              model,
              column.messages.concat(userMessage).map((m) => ({
                role: m.role,
                content: m.content,
              })),
              apiKeys,
              (chunk) => {
                accumulatedContent += chunk;
                set((state) => ({
                  columns: state.columns.map((col) =>
                    col.id === columnId
                      ? {
                          ...col,
                          messages: col.messages.map((msg) =>
                            msg.id === assistantMessageId
                              ? { ...msg, content: accumulatedContent }
                              : msg
                          ),
                        }
                      : col
                  ),
                }));
              }
            );

            // Mark streaming as complete
            set((state) => ({
              columns: state.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      messages: col.messages.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, isStreaming: false }
                          : msg
                      ),
                      isLoading: false,
                    }
                  : col
              ),
            }));
          } catch (error) {
            set((state) => ({
              columns: state.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      isLoading: false,
                      error: error instanceof Error ? error.message : 'Unknown error',
                    }
                  : col
              ),
            }));
            toast.error(`Ошибка в ${model.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        });

        await Promise.all(promises);
      },
    }),
    {
      name: 'aunixw-storage',
      partialize: (state) => ({ apiKeys: state.apiKeys }),
    }
  )
);
