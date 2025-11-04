import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import type { ChatMessage, Provider } from '../types';

// --- Helper Functions ---
const buildGeminiHistory = (messages: ChatMessage[]): Content[] => {
    return messages.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => part.text)
    }));
};

const buildOpenRouterHistory = (messages: ChatMessage[]): {role: string, content: string}[] => {
     return messages.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.parts[0].text
    }));
}

// --- Provider-Specific Functions ---

export const generateGeminiChatResponse = async (model: string, history: ChatMessage[], newMessage: string, systemPrompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set for Gemini. This is a mandatory requirement.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chatOptions: any = {
        model: model,
        history: buildGeminiHistory(history),
    };

    const config: any = {};
    if (model === 'gemini-2.5-pro') {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }
    if (systemPrompt.trim()) {
        config.systemInstruction = systemPrompt;
    }

    if (Object.keys(config).length > 0) {
        chatOptions.config = config;
    }
    
    const chat = ai.chats.create(chatOptions);
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
}

export const generateOpenRouterChatResponse = async (model: string, history: ChatMessage[], newMessage: string, apiKey: string, systemPrompt: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("OpenRouter API Key not provided. Please add it in Settings.");
    }

    const messages: {role: string, content: string}[] = [];
    if (systemPrompt.trim()) {
        messages.push({ role: "system", content: systemPrompt });
    }
    messages.push(...buildOpenRouterHistory(history));
    messages.push({ role: "user", content: newMessage });


    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": `${window.location.protocol}//${window.location.host}`,
            "X-Title": "Gemini Multi-Modal AI Suite",
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}


// --- Main Service Function ---

export const getChatResponse = async (provider: Provider, model: string, history: ChatMessage[], newMessage: string, openRouterKey: string, systemPrompt: string): Promise<string> => {
    switch (provider) {
        case 'Gemini':
            return generateGeminiChatResponse(model, history, newMessage, systemPrompt);
        case 'OpenRouter':
            return generateOpenRouterChatResponse(model, history, newMessage, openRouterKey, systemPrompt);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
};

// --- Image Analysis (Gemini-specific) ---

export const analyzeImage = async (prompt: string, imagePart: { inlineData: { data: string; mimeType: string } }): Promise<string> => {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text;
};