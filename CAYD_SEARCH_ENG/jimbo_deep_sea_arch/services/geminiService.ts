import { GoogleGenAI } from '@google/genai';
import { GroundingChunk, FilterOptions } from '../types';

// Define the structure of the search result object
export interface SearchResult {
    report: string;
    sources: GroundingChunk[];
}

// Initialize the Google AI client
// The API key is expected to be available in the environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Prompts for the AI model
const getPrompt = (topic: string, isDeepSearch: boolean, filters: FilterOptions): string => {
    
    let filterInstructions = '';
    if (filters.date !== 'any' || filters.contentType !== 'any') {
        filterInstructions += ' When searching, prioritize results';
        if (filters.date !== 'any') {
            filterInstructions += ` from the past ${filters.date}`;
        }
        if (filters.contentType !== 'any') {
             if (filters.date !== 'any') filterInstructions += ' and';
            filterInstructions += ` of the content type "${filters.contentType}"`;
        }
        filterInstructions += '.';
    }

    if (isDeepSearch) {
        return `
            Generate a comprehensive and well-structured research report on the topic: "${topic}".
            The report should be detailed and formatted in Markdown. It must include the following sections:
            
            ## Executive Summary
            A concise overview of the key findings.
            
            ## Introduction
            Background information and the scope of the report.
            
            ## Key Findings
            A detailed analysis of the main points, using bullet points or numbered lists where appropriate.
            
            ### Key Data Points
            A Markdown table summarizing crucial data, statistics, or metrics. If no specific data is available, create a table with relevant comparative points.
            
            ## Conclusion
            A summary of the findings and potential implications.

            Ensure the language is professional and objective. Cite all sources used to generate this report.
            ${filterInstructions}
        `;
    }

    return `
        Generate a concise research summary about "${topic}".
        The summary should be a few paragraphs long, written in clear and accessible language, and formatted in Markdown.
        Cite all sources used to generate this summary.
        ${filterInstructions}
    `;
};


/**
 * Performs a search using the Gemini API with Google Search grounding.
 * @param topic The user's search query.
 * @param isDeepSearch Whether to perform a deep, structured search.
 * @param filters Search filters for date and content type.
 * @param signal An AbortSignal to cancel the request.
 * @returns A promise that resolves to a SearchResult object.
 */
export const performSearch = async (
    topic: string,
    isDeepSearch: boolean,
    filters: FilterOptions,
    signal: AbortSignal
): Promise<SearchResult> => {
    try {
        if (!topic) {
            throw new Error('Search topic cannot be empty.');
        }

        const prompt = getPrompt(topic, isDeepSearch, filters);
        
        // Use a more capable model for deep search
        const modelName = isDeepSearch ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
            // The signal for aborting is not directly supported in this SDK version's generateContent options.
            // We'd typically use it with fetch. If the request needs to be abortable,
            // we'd need to wrap this call or use a library that supports it.
            // For now, we'll proceed without native abort functionality in the SDK call itself,
            // but the signal is kept in the signature for future-proofing and to cancel before the call is made.
        });
        
        if (signal.aborted) {
            throw new Error('Request aborted');
        }

        const report = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        if (!report) {
            throw new Error('Received an empty report from the API.');
        }

        return { report, sources };

    } catch (error) {
        console.error('Error performing search:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate report: ${error.message}`);
        }
        throw new Error('An unknown error occurred during the search.');
    }
};
