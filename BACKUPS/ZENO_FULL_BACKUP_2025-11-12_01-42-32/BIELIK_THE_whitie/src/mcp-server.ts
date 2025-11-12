/**
 * MCP Server Entry Point
 * Model Context Protocol server for ZENO Browser
 */

import express = require('express');
import cors = require('cors');

const app = express();
const PORT = process.env.MCP_PORT || 8788;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://ollama:11434';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'MCP Server', ollama: OLLAMA_URL });
});

// MCP Tools endpoint
app.get('/api/tools', (req, res) => {
    res.json({
        tools: [
            { id: 'web_search', name: 'Web Search', enabled: true },
            { id: 'content_analysis', name: 'Content Analysis', enabled: true },
            { id: 'bookmark_manager', name: 'Bookmark Manager', enabled: true },
            { id: 'page_summarizer', name: 'Page Summarizer', enabled: true },
            { id: 'link_extractor', name: 'Link Extractor', enabled: true },
            { id: 'web_navigation', name: 'Web Navigation', enabled: true }
        ]
    });
});

// Execute MCP command
app.post('/api/execute', async (req, res) => {
    const { command, tool, params } = req.body;

    try {
        // Forward to Ollama for processing
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'SpeakLeash/bielik-4.5b-v3.0-instruct:Q8_0',
                prompt: `Execute MCP tool: ${tool}\nCommand: ${command}\nParams: ${JSON.stringify(params)}`,
                stream: false
            })
        });

        const result = await response.json();

        res.json({
            success: true,
            tool,
            result: result.response,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MCP Server running on port ${PORT}`);
    console.log(`📡 Ollama endpoint: ${OLLAMA_URL}`);
});
