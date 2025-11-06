import { GoogleGenAI, Type } from "@google/genai";
import type { Story, ScenePrompt } from '../types';
import { ROLE_PROMPT, STEP_1_PROMPT, getStep2And3Prompt, getStep4Prompt } from '../constants';

const getGeminiApiKey = (): string | null => {
    const storedKeys = localStorage.getItem('apiKeys');
    if (storedKeys) {
        return JSON.parse(storedKeys).gemini || null;
    }
    return null;
};

const getAiClient = () => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("Google Gemini API Key is not set. Please add it in the API Key Management.");
    }
    return new GoogleGenAI({ apiKey });
}

// Parser for Step 1
const parseStories = (responseText: string): Story[] => {
    const storiesRaw = responseText.split('---').filter(s => s.trim());
    return storiesRaw.map((storyText, index) => {
        const lines = storyText.trim().split('\n');
        const titleLine = lines.find(line => line.toUpperCase().startsWith('STORY TITLE:'));
        const title = titleLine ? titleLine.replace(/STORY TITLE:/i, '').trim() : `Story ${index + 1}`;
        const content = lines.filter(line => !line.toUpperCase().startsWith('STORY TITLE:')).join('\n').trim();
        return { id: index, title, content };
    });
};


export const generateStoryIdeas = async (): Promise<Story[]> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: STEP_1_PROMPT }] }],
            config: {
                systemInstruction: ROLE_PROMPT,
                temperature: 0.8,
            }
        });
        const responseText = response.text;
        return parseStories(responseText);
    } catch (error) {
        console.error("Error generating story ideas:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to communicate with Gemini API: ${error.message}`);
        }
        throw new Error("Failed to communicate with Gemini API.");
    }
};

export const expandStoryAndCreateCast = async (storyContent: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = getStep2And3Prompt(storyContent);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
             config: {
                systemInstruction: ROLE_PROMPT,
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error expanding story:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to communicate with Gemini API: ${error.message}`);
        }
        throw new Error("Failed to communicate with Gemini API.");
    }
};

export const generateVisualPrompts = async (script: string): Promise<ScenePrompt[]> => {
    try {
        const ai = getAiClient();
        const prompt = getStep4Prompt(script);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: ROLE_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            scene_number: { type: Type.INTEGER },
                            scene_text: { type: Type.STRING },
                            image_prompt: { type: Type.STRING },
                            video_prompt: { type: Type.STRING },
                        },
                         required: ["scene_number", "scene_text", "image_prompt", "video_prompt"]
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const prompts = JSON.parse(jsonText);
        return prompts;

    } catch (error) {
        console.error("Error generating visual prompts:", error);
        if (error instanceof Error) {
             throw new Error(`Failed to communicate with Gemini API or parse its JSON response: ${error.message}`);
        }
        throw new Error("Failed to communicate with Gemini API or parse its JSON response.");
    }
};