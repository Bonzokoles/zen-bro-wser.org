/**
 * Central Agent Configuration
 * Single source of truth for all BIELIK agents
 * Used by both BIELIK_THE_whitie Worker and ZENO_WEB_CORE_APP API
 */

export interface AgentConfig {
    id: string;
    role: string;
    version: string;
    author: string;
    systemPrompt: string;
    modelId: string;
    toolIds: string[];
    capabilities: string[];
    status?: 'active' | 'idle' | 'error' | 'offline';
}

/**
 * Main agent configurations
 * These are the production agent definitions
 */
export const agents: AgentConfig[] = [
    {
        id: 'researcher',
        role: 'Expert Researcher',
        version: '1.0.0',
        author: 'BIELIK System',
        systemPrompt: 'You are an expert researcher. Your goal is to find the most relevant and up-to-date information on a given topic using the tools provided. Synthesize your findings into a concise summary.',
        modelId: 'gpt-4o',
        toolIds: ['web_search', 'file_write'],
        capabilities: ['web-scraping', 'data-synthesis', 'reporting', 'fact-checking', 'source-validation'],
    },
    {
        id: 'coder',
        role: 'Senior Software Engineer',
        version: '1.0.0',
        author: 'BIELIK System',
        systemPrompt: 'You are a senior software engineer. Your task is to write clean, efficient, and well-documented code to solve the given problem. You can read existing files and write new ones.',
        modelId: 'gpt-4o', // Changed from local-llama3 for consistency
        toolIds: ['file_read', 'file_write', 'code_linter', 'execute_code'],
        capabilities: ['code-generation', 'debugging', 'code-review', 'refactoring', 'testing'],
    },
    {
        id: 'planner',
        role: 'Project Planner',
        version: '1.0.0',
        author: 'BIELIK System',
        systemPrompt: 'You are a project planner. Your job is to break down a complex task into a series of smaller, manageable steps. Provide a clear, ordered list of steps to be taken.',
        modelId: 'gemini-1.5-pro',
        toolIds: ['file_read', 'file_write'],
        capabilities: ['task-decomposition', 'step-by-step-planning', 'resource-allocation', 'timeline-estimation', 'risk-assessment'],
    },
];

/**
 * Get agent by ID
 */
export function getAgentById(id: string): AgentConfig | undefined {
    return agents.find(agent => agent.id === id);
}

/**
 * Get all agent IDs
 */
export function getAgentIds(): string[] {
    return agents.map(agent => agent.id);
}

/**
 * Validate agent ID
 */
export function isValidAgentId(id: string): boolean {
    return agents.some(agent => agent.id === id);
}
