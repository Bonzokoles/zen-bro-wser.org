/**
 * AI Assistant Service - OpenAI Integration
 * Provides AI assistant functionality for the ZENO application
 * Can be taught all application functions through system prompts
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * System prompt that teaches the assistant about ZENO application
 */
export const ZENO_SYSTEM_PROMPT = `You are ZENO AI Assistant, an expert helper for the ZENO Web Browser application.

## ZENO Application Overview

ZENO is an advanced web browser application with the following key features:

### 1. **Iframe Tester** (/iframe-tester)
- Test websites for iframe compatibility
- Check X-Frame-Options and CSP headers
- Text selection and extraction from iframes
- Auto-rotation feature for testing multiple sites
- Export selected text in multiple formats (Markdown, Text, JSON, HTML)
- Keyboard shortcuts: Ctrl+F (search), Ctrl+S (save), Ctrl+R (rotate)

### 2. **Agents Manager** (/agents)
- Monitor and manage AI agents
- Start, pause, resume, and terminate agents
- Track agent performance and health
- View agent logs and configurations
- Real-time agent status dashboard

### 3. **Admin Panel** (/admin)
- Site management (add, edit, delete sites)
- User administration
- System statistics and monitoring
- Export reports and analytics
- Database management interface

### 4. **Search System** (/search-demo, /advanced-search)
- Real-time site search with autocomplete
- Category filters and iframe-friendly filtering
- Favorites management (Ctrl+B)
- Search history tracking
- Sorting options: alphabetical, by date, by popularity
- API integration with pagination

### 5. **Video Players** (/video-demo)
- Internet Archive player integration
- YouTube player with event callbacks
- Elfsight widget support
- Responsive design and fullscreen support

### 6. **Orchestrator System** (/orchestrator)
- AI-powered content classification
- Automatic sorting into thematic libraries (art, culture, film, architecture, technology, science)
- Batch processing with concurrent workers
- OpenAI integration for intelligent categorization
- Local library management system
- Processing queue with retry logic

### 7. **Debug Console** (/debug)
- System status monitoring (F12)
- Debug logs and error tracking
- MCP service testing
- Real-time console output

### 8. **About Page** (/about)
- Project information
- Feature overview
- Team and contribution information

## User Assistance Guidelines

When helping users:
1. Understand their goal with the specific ZENO feature
2. Provide step-by-step instructions with keyboard shortcuts
3. Explain relevant API endpoints if needed
4. Suggest best practices and tips
5. Help troubleshoot errors or issues
6. Guide users through the high-contrast interface design

## Technical Details

- **Framework**: Astro + React + TypeScript
- **Design**: High-contrast theme (black/white/red/yellow)
- **Sharp Corners**: border-radius: 0 for accessibility
- **Navigation**: Keyboard shortcuts throughout (Ctrl+T for Tools Panel)
- **API Base**: /api/* endpoints
- **Storage**: Local libraries in ./libraries/[category]/

Be helpful, concise, and technical when needed. Always refer to the correct page URLs and keyboard shortcuts.`;

/**
 * Chat with OpenAI Assistant
 * @param messages - Conversation history
 * @param apiKey - OpenAI API key
 * @param model - Model to use (default: gpt-4o-mini)
 */
export async function chatWithAssistant(
  messages: Message[],
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<ChatResponse> {
  try {
    // Add system prompt if not present
    if (!messages.some(m => m.role === 'system')) {
      messages = [
        { role: 'system', content: ZENO_SYSTEM_PROMPT },
        ...messages
      ];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    return {
      message: data.choices[0]?.message?.content || 'No response',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    console.error('[AI Assistant] ❌ Error:', error);
    throw error;
  }
}

/**
 * Streaming chat response (for real-time UI updates)
 * @param messages - Conversation history
 * @param apiKey - OpenAI API key
 * @param onChunk - Callback for each chunk of text
 * @param model - Model to use
 */
export async function chatWithAssistantStreaming(
  messages: Message[],
  apiKey: string,
  onChunk: (chunk: string) => void,
  model: string = 'gpt-4o-mini'
): Promise<void> {
  try {
    // Add system prompt if not present
    if (!messages.some(m => m.role === 'system')) {
      messages = [
        { role: 'system', content: ZENO_SYSTEM_PROMPT },
        ...messages
      ];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;

            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('[AI Assistant Streaming] ❌ Error:', error);
    throw error;
  }
}

/**
 * Quick answer - single question, single answer
 * @param question - User question
 * @param apiKey - OpenAI API key
 */
export async function quickAnswer(
  question: string,
  apiKey: string
): Promise<string> {
  const response = await chatWithAssistant(
    [{ role: 'user', content: question }],
    apiKey
  );

  return response.message;
}

/**
 * Validate OpenAI API key
 * @param apiKey - API key to validate
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('[AI Assistant] ❌ API key validation error:', error);
    return false;
  }
}
