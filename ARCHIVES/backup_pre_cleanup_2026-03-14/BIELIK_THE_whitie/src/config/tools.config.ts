export interface ToolConfig {
  id: string; // Unique identifier for the tool, e.g., 'web_search'
  name: string; // Human-readable name
  description: string; // Description of what the tool does
  filePath: string; // Path to the file containing the tool's implementation
  functionName: string; // The name of the function to call to execute the tool
}

export const tools: ToolConfig[] = [
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Performs a web search using the Tavily API to find up-to-date information.',
    filePath: '../tools/WebSearchTool.ts',
    functionName: 'executeWebSearch',
  },
  {
    id: 'file_read',
    name: 'File Reader',
    description: 'Reads the content of a specified file from the local filesystem.',
    filePath: '../tools/FileSystemTool.ts',
    functionName: 'readFile',
  },
  {
    id: 'file_write',
    name: 'File Writer',
    description: 'Writes or overwrites a file with specified content on the local filesystem.',
    filePath: '../tools/FileSystemTool.ts',
    functionName: 'writeFile',
  },
  {
    id: 'code_linter',
    name: 'Code Linter',
    description: 'Analyzes a code snippet for syntax errors and style issues.',
    filePath: '../tools/CodeAnalysisTool.ts',
    functionName: 'lintCode',
  },
];
