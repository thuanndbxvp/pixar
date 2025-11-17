import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Story, ScenePrompt, ApiKeyStore } from '../types';
import { STEP_1_PROMPT, getStep1FromSeedPrompt, getStep2Prompt, getStep3Prompt, getStep4Prompt, getRolePrompt, getRolePromptNoTranslation, ANALYZE_IMAGE_STYLE_PROMPT } from '../constants';

const getGeminiApiKey = (): string | null => {
    const storeStr = localStorage.getItem('apiKeyStore');
    if (!storeStr) return null;
    
    const store: ApiKeyStore = JSON.parse(storeStr);
    const geminiStore = store.gemini;

    if (!geminiStore || !geminiStore.activeKeyId) return null;

    const activeKey = geminiStore.keys.find(k => k.id === geminiStore.activeKeyId);
    return activeKey ? activeKey.key : null;
};

const getAiClient = () => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("Google Gemini API Key chưa được kích hoạt. Vui lòng thêm và kích hoạt một key trong phần Quản lý API.");
    }
    return new GoogleGenAI({ apiKey });
}

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: "ping" }] }],
            config: { maxOutputTokens: 1 }
        });
        return true;
    } catch (error) {
        console.error("Gemini API Key validation failed:", error);
        return false;
    }
};

// Parser for Step 1
const parseStories = (responseText: string): Story[] => {
    const storiesRaw = responseText.split('---').filter(s => s.trim() && s.toUpperCase().includes('STORY TITLE:'));
    return storiesRaw.map((storyText, index) => {
        const lines = storyText.trim().split('\n');
        const titleLine = lines.find(line => line.toUpperCase().startsWith('STORY TITLE:'));
        const title = titleLine ? titleLine.replace(/STORY TITLE:/i, '').trim() : `Story ${index + 1}`;
        const content = lines.filter(line => !line.toUpperCase().startsWith('STORY TITLE:')).join('\n').trim();
        return { id: index, title, content };
    });
};


export const generateStoryIdeas = async (model: string, mood: string): Promise<Story[]> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: STEP_1_PROMPT }] }],
            config: {
                systemInstruction: getRolePrompt(mood),
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

export const generateStoryIdeasFromSeed = async (seedIdea: string, model: string, mood: string): Promise<Story[]> => {
    try {
        const ai = getAiClient();
        const prompt = getStep1FromSeedPrompt(seedIdea);
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: getRolePrompt(mood),
                temperature: 0.8,
            }
        });
        const responseText = response.text;
        return parseStories(responseText);
    } catch (error) {
        console.error("Error generating story ideas from seed:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to communicate with Gemini API: ${error.message}`);
        }
        throw new Error("Failed to communicate with Gemini API.");
    }
};

export const expandStory = async (storyContent: string, model: string, mood: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = getStep2Prompt(storyContent);
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: getRolePromptNoTranslation(mood),
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

export const createScriptFromStory = async (expandedStory: string, model: string, aspectRatio: '9:16' | '16:9', mood: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = getStep3Prompt(expandedStory, aspectRatio);
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
             config: {
                systemInstruction: getRolePromptNoTranslation(mood),
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error creating script from story:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to communicate with Gemini API: ${error.message}`);
        }
        throw new Error("Failed to communicate with Gemini API.");
    }
};

export const generateVisualPrompts = async (script: string, model: string, aspectRatio: '9:16' | '16:9', mood: string, styleDescription: string): Promise<ScenePrompt[]> => {
    try {
        const ai = getAiClient();
        const prompt = getStep4Prompt(script, aspectRatio, styleDescription);
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: getRolePromptNoTranslation(mood, styleDescription),
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

export const analyzeImageStyle = async (imageBase64: string, mimeType: string, model: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType
            }
        };
        const textPart = { text: ANALYZE_IMAGE_STYLE_PROMPT };

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [textPart, imagePart] }]
        });
        
        return response.text;
    } catch (error) {
        console.error("Error analyzing image style with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze image with Gemini API: ${error.message}`);
        }
        throw new Error("Failed to analyze image with Gemini API.");
    }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
              responseModalities: [Modality.IMAGE], 
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return part.inlineData.data;
          }
        }
        throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi của Gemini.");
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate image with Gemini API: ${error.message}`);
        }
        throw new Error("Failed to generate image with Gemini API.");
    }
};

export const translateText = async (text: string, model: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = `Translate the following English text to Vietnamese. Maintain the original formatting, including markdown and line breaks. Do not add any extra explanations or introductions. The text to translate is:\n\n---\n\n${text}`;
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                temperature: 0.2,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error translating text with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to translate with Gemini API: ${error.message}`);
        }
        throw new Error("Failed to translate with Gemini API.");
    }
};