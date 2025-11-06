import type { Story, ScenePrompt } from '../types';
import { ROLE_PROMPT, STEP_1_PROMPT, getStep2And3Prompt, getStep4PromptOpenAI } from '../constants';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const getOpenAiApiKey = (): string | null => {
    const storedKeys = localStorage.getItem('apiKeys');
    if (storedKeys) {
        return JSON.parse(storedKeys).openai || null;
    }
    return null;
};

// Parser for Step 1
const parseStoriesOpenAI = (responseText: string): Story[] => {
    const storiesRaw = responseText.split('---').filter(s => s.trim());
    return storiesRaw.map((storyText, index) => {
        const lines = storyText.trim().split('\n');
        const titleLine = lines.find(line => line.toUpperCase().startsWith('STORY TITLE:'));
        const title = titleLine ? titleLine.replace(/STORY TITLE:/i, '').trim() : `Story ${index + 1}`;
        const content = lines.filter(line => !line.toUpperCase().startsWith('STORY TITLE:')).join('\n').trim();
        return { id: index, title, content };
    });
};

const callOpenAI = async (messages: any[], jsonMode: boolean = false) => {
    const apiKey = getOpenAiApiKey();
    if (!apiKey) {
        throw new Error("OpenAI API Key is not set. Please add it in the API Key Management.");
    }

    const body: any = {
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
    };

    if (jsonMode) {
        body.response_format = { type: 'json_object' };
    }

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        throw new Error(`OpenAI API request failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

export const generateStoryIdeas = async (): Promise<Story[]> => {
    const messages = [
        { role: 'system', content: ROLE_PROMPT },
        { role: 'user', content: STEP_1_PROMPT }
    ];
    const responseText = await callOpenAI(messages);
    return parseStoriesOpenAI(responseText);
};

export const expandStoryAndCreateCast = async (storyContent: string): Promise<string> => {
    const prompt = getStep2And3Prompt(storyContent);
    const messages = [
        { role: 'system', content: ROLE_PROMPT },
        { role: 'user', content: prompt }
    ];
    return await callOpenAI(messages);
};

export const generateVisualPrompts = async (script: string): Promise<ScenePrompt[]> => {
    const prompt = getStep4PromptOpenAI(script);
    const messages = [
        { role: 'system', content: ROLE_PROMPT },
        { role: 'user', content: prompt }
    ];

    const jsonString = await callOpenAI(messages, true);
    // The model might return a markdown code block `json ... `
    const cleanedJsonString = jsonString.replace(/^```json\n|```$/g, '').trim();
    const result = JSON.parse(cleanedJsonString);
    if (!result.scenes || !Array.isArray(result.scenes)) {
        throw new Error("Invalid JSON structure received from OpenAI. Expected a 'scenes' array.");
    }
    return result.scenes;
};
