export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type Mode = 'chat' | 'image-analyzer' | 'transcriber' | 'settings';

export type Provider = 'Gemini' | 'OpenRouter';

export interface Model {
    id: string;
    name: string;
    provider: Provider;
}