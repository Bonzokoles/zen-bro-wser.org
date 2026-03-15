export interface SandboxToolProps {
  embedded?: boolean;
  onClose?: () => void;
  onResult?: (data: unknown) => void;
  sandboxId?: string;
  theme?: 'dark' | 'light';
}

export interface SandboxToolMeta {
  id: string;
  name: string;
  icon: string;
  windowSize: { w: number; h: number };
  description: string;
  category: 'analysis' | 'ai' | 'network' | 'media' | 'utility';
}
