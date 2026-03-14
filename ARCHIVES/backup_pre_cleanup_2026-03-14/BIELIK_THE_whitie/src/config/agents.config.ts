import { ModelProvider } from './models.config';

export interface AgentConfig {
  id: string; // Unique identifier for the agent profile, e.g., 'researcher'
  role: string; // The role the agent will play
  version: string; // Version of the agent profile
  author: string; // Author or maintainer
  systemPrompt: string; // The system prompt that defines the agent's behavior
  modelId: string; // The ID of the model to use (from models.config.ts)
  toolIds: string[]; // List of tool IDs this agent is allowed to use
  capabilities: string[]; // High-level description of what the agent can do
}

export const agents: AgentConfig[] = [
  {
    id: 'researcher',
    role: 'Expert Researcher',
    version: '1.0.0',
    author: 'BIELIK System',
    systemPrompt: 'You are an expert researcher. Your goal is to find the most relevant and up-to-date information on a given topic using the tools provided. Synthesize your findings into a concise summary.',
    modelId: 'gpt-4o',
    toolIds: ['web_search', 'file_write'],
    capabilities: ['web-scraping', 'data-synthesis', 'reporting'],
  },
  {
    id: 'coder',
    role: 'Senior Software Engineer',
    version: '1.0.0',
    author: 'BIELIK System',
    systemPrompt: 'You are a senior software engineer. Your task is to write clean, efficient, and well-documented code to solve the given problem. You can read existing files and write new ones.',
    modelId: 'local-llama3',
    toolIds: ['file_read', 'file_write', 'code_linter'],
    capabilities: ['code-generation', 'debugging', 'code-review'],
  },
  {
    id: 'planner',
    role: 'Project Planner',
    version: '1.0.0',
    author: 'BIELIK System',
    systemPrompt: 'You are a project planner. Your job is to break down a complex task into a series of smaller, manageable steps. Provide a clear, ordered list of steps to be taken.',
    modelId: 'gemini-1.5-pro',
    toolIds: [],
    capabilities: ['task-decomposition', 'step-by-step-planning'],
  },
];
