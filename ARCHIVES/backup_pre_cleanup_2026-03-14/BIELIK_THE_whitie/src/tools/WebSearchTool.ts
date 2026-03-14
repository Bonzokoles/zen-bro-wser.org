import axios from 'axios';

const TAVILY_API_URL = 'https://api.tavily.com/search';

/**
 * Performs a web search using the Tavily API.
 * @param query The search query.
 * @returns A JSON string with the search results.
 */
export async function executeWebSearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return 'Error: TAVILY_API_KEY is not set in the environment variables.';
  }

  try {
    const response = await axios.post(TAVILY_API_URL, {
      api_key: apiKey,
      query: query,
      search_depth: 'basic',
      include_answer: true,
      max_results: 5,
    });

    if (response.data && response.data.results) {
      // Simplify the results for the agent
      const simplifiedResults = response.data.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
      }));
      return JSON.stringify(simplifiedResults);
    } else {
      return 'No results found.';
    }
  } catch (error: unknown) {
    const err = error as Error;
    return `Error performing web search: ${err.message}`;
  }
}
