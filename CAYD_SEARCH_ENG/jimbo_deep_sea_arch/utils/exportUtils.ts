import { GroundingChunk } from '../types';

/**
 * Triggers a browser download for the given content.
 * @param content The content of the file.
 * @param filename The desired name of the file.
 * @param mimeType The MIME type of the file.
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Parses a Markdown table from a larger string and converts it to a CSV string.
 * @param markdown The full markdown string containing the report.
 * @returns A CSV formatted string or an empty string if no table is found.
 */
export const parseMarkdownTableToCSV = (markdown: string): string => {
    const tableRegex = /### Key Data Points\s*\n\s*\|(.+)\|\s*\n\s*\|[-| :]+\|\s*\n((?:\|.*\|\s*\n?)*)/;
    const match = markdown.match(tableRegex);

    if (!match) {
        return '';
    }

    const [, headerLine, bodyLines] = match;
    
    const parseRow = (rowString: string): string[] => {
        return rowString.split('|').map(cell => cell.trim()).slice(1, -1);
    };
    
    const escapeCsvCell = (cell: string): string => {
        // If the cell contains a comma, double quote, or newline, enclose it in double quotes.
        // Also, double up any existing double quotes.
        if (/[",\n]/.test(cell)) {
            return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
    };

    const headers = parseRow(headerLine).map(escapeCsvCell).join(',');
    const rows = bodyLines.trim().split('\n').map(line => {
        return parseRow(line).map(escapeCsvCell).join(',');
    });

    return [headers, ...rows].join('\n');
};

/**
 * Formats the entire report and sources into a single Markdown string.
 * @param report The main report content from Gemini.
 * @param sources The array of web sources.
 * @param topic The original search topic.
 * @returns A formatted Markdown string.
 */
export const formatReportAsMarkdown = (report: string, sources: GroundingChunk[], topic: string): string => {
    const sourceLinks = sources
        .filter(s => s.web && s.web.uri)
        .map(s => `- [${s.web?.title || 'Untitled'}](${s.web?.uri})`)
        .join('\n');

    return `
# Research Report: ${topic}

${report}

---

## Sources

${sourceLinks || 'No sources were cited.'}
    `.trim();
};

/**
 * Strips markdown formatting to produce a plain text version of the report.
 * @param report The markdown report string.
 * @returns A plain text string.
 */
export const formatReportAsText = (report: string): string => {
    return report
        .replace(/###\s*(.*)/g, '--- $1 ---')
        .replace(/##\s*(.*)/g, '\n=== $1 ===\n')
        .replace(/#\s*(.*)/g, '\n========== $1 ==========\n')
        .replace(/_([^_]+)_/g, '$1') // italics
        .replace(/\*([^*]+)\*/g, '$1') // italics
        .replace(/__([^_]+)__/g, '$1') // bold
        .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
        .replace(/`([^`]+)`/g, '$1') // inline code
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links
        .trim();
};
