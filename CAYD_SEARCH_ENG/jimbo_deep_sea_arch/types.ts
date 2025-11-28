// This type is defined in the @google/genai library, but we redefine it here
// for clarity and to avoid direct dependency in components.
// It represents a chunk of grounding information from a Google Search result.
export interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
    maps?: {
        uri: string;
        title: string;
        placeAnswerSources?: {
            reviewSnippets: any[];
        };
    };
}

export type DateFilter = 'any' | 'day' | 'week' | 'month';
export type ContentTypeFilter = 'any' | 'articles' | 'blogs' | 'forums' | 'academic';

export interface FilterOptions {
    date: DateFilter;
    contentType: ContentTypeFilter;
}
