import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Fix: Correct import path for geminiService
import { SearchResult } from '../services/geminiService';
import { LinkIcon } from './icons/LinkIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import {
    downloadFile,
    parseMarkdownTableToCSV,
    formatReportAsMarkdown,
    formatReportAsText,
} from '../utils/exportUtils';
import { useLanguage } from '../context/LanguageProvider';

interface ResultsDisplayProps {
    result: SearchResult | null;
    topic: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, topic }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [copyStatus, setCopyStatus] = useState(false);
    const { t } = useLanguage();

    if (!result) {
        return null;
    }

    const { report, sources } = result;

    const handleExport = (format: 'md' | 'txt' | 'csv') => {
        const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        switch (format) {
            case 'md':
                const mdContent = formatReportAsMarkdown(report, sources, topic);
                downloadFile(mdContent, `${sanitizedTopic}_report.md`, 'text/markdown;charset=utf-8');
                break;
            case 'txt':
                const textContent = formatReportAsText(report);
                downloadFile(textContent, `${sanitizedTopic}_report.txt`, 'text/plain;charset=utf-8');
                break;
            case 'csv':
                const csvContent = parseMarkdownTableToCSV(report);
                if (csvContent) {
                    downloadFile(csvContent, `${sanitizedTopic}_data.csv`, 'text/csv;charset=utf-8');
                } else {
                    alert('No data table found in the report to export as CSV.');
                }
                break;
        }
        setIsDropdownOpen(false);
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(report).then(() => {
            setCopyStatus(true);
            setTimeout(() => setCopyStatus(false), 2000);
        });
    };


    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{t('resultsTitle')}</h2>
                <div className="flex items-center gap-2">
                     <button
                        onClick={handleCopyToClipboard}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 transition-colors border border-slate-700"
                        title={t('copyToClipboard')}
                    >
                        {copyStatus ? t('copied') : t('copyToClipboard')}
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-500"
                        >
                            <DownloadIcon className="h-5 w-5 mr-2" />
                            {t('export')}
                        </button>
                        {isDropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-56 shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-20 border border-slate-700">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                    <button onClick={() => handleExport('md')} className="text-left w-full block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">{t('exportAsMarkdown')}</button>
                                    <button onClick={() => handleExport('txt')} className="text-left w-full block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">{t('exportAsText')}</button>
                                    <button onClick={() => handleExport('csv')} className="text-left w-full block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">{t('exportDataAsCsv')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <article className="prose prose-invert prose-slate max-w-none bg-slate-900 border border-slate-700 p-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
            </article>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">{t('sourcesTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources?.length > 0 ? sources.map((source, index) => (
                    source.web && (
                        <a
                            key={index}
                            href={source.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-slate-900 p-4 hover:bg-slate-800 transition-colors border border-slate-700"
                        >
                            <div className="flex items-start">
                                <LinkIcon className="h-5 w-5 text-slate-400 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-cyan-400 break-words">{source.web.title}</p>
                                    <p className="text-sm text-slate-400 truncate">{source.web.uri}</p>
                                </div>
                            </div>
                        </a>
                    )
                )) : <p className="text-slate-400">No sources were cited for this report.</p>}
            </div>
        </div>
    );
};