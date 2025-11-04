import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Provider, Model } from '../types';
import * as aiService from '../services/geminiService';
import { SendIcon, UserIcon, BotIcon } from './icons/Icons';

const ALL_MODELS: Model[] = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Gemini'},
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Thinking)', provider: 'Gemini'},
    // --- Added Free OpenRouter Models ---
    { id: 'mistralai/mistral-7b-instruct-free', name: 'Mistral 7B Instruct (Free)', provider: 'OpenRouter'},
    { id: 'google/gemma-2-9b-it:free', name: 'Google Gemma 2 9B (Free)', provider: 'OpenRouter'},
    { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Meta Llama 3 8B (Free)', provider: 'OpenRouter'},
    { id: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free', name: 'Nous Hermes 2 Mixtral (Free)', provider: 'OpenRouter'},
    // --- End of Added Models ---
    { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'OpenRouter'},
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenRouter'},
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'OpenRouter'},
];

const PROVIDERS: Provider[] = ['Gemini', 'OpenRouter'];

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>('Gemini');
  const [model, setModel] = useState<string>(ALL_MODELS[0].id);
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = localStorage.getItem('openRouterApiKey') || '';
    setOpenRouterKey(key);
  }, []);

  const availableModels = ALL_MODELS.filter(m => m.provider === provider);

  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.find(m => m.id === model)) {
      setModel(availableModels[0].id);
    }
  }, [provider, availableModels, model]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    if (provider === 'OpenRouter' && !openRouterKey) {
      setError("OpenRouter API key is not set. Please add it in the Settings page.");
      return;
    }

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await aiService.getChatResponse(provider, model, messages, currentInput, openRouterKey, systemPrompt);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      setMessages([...newMessages, modelMessage]);
    } catch (err) {
      console.error('Error fetching response:', err);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: `Sorry, something went wrong: ${(err as Error).message}` }] };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800">
      <header className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col gap-3">
        <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold mr-4">Chat</h2>
            <div className="flex items-center gap-2">
            <label htmlFor="provider-select" className="text-sm font-medium text-gray-600 dark:text-gray-400">Provider:</label>
            <select 
                id="provider-select"
                value={provider} 
                onChange={e => setProvider(e.target.value as Provider)}
                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
                {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            </div>
            <div className="flex items-center gap-2">
            <label htmlFor="model-select" className="text-sm font-medium text-gray-600 dark:text-gray-400">Model:</label>
            <select 
                id="model-select"
                value={model} 
                onChange={e => setModel(e.target.value)}
                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                {availableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            </div>
        </div>
        <div>
            <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">System Prompt</label>
            <input
            id="system-prompt"
            type="text"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Guide the AI's behavior, e.g., 'You are a pirate.'"
            className="w-full p-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-sm"
            disabled={isLoading}
            />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 flex items-center justify-center">
                    <BotIcon />
                </div>
            )}
            <div className={`max-w-xl p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>
              <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
             {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-500 dark:bg-gray-600 flex items-center justify-center">
                    <UserIcon />
                </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-4">
                 <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 flex items-center justify-center">
                    <BotIcon />
                </div>
                <div className="max-w-xl p-3 bg-white dark:bg-gray-700">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-indigo-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};