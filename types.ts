import { themeColors } from "./themes";

export enum Step {
  IDEATION = 'IDEATION',
  STORY_SELECTION = 'STORY_SELECTION',
  SCRIPT_GENERATION = 'SCRIPT_GENERATION',
  SCRIPT_GENERATED = 'SCRIPT_GENERATED',
  PROMPT_GENERATION = 'PROMPT_GENERATION',
  PROMPTS_GENERATED = 'PROMPTS_GENERATED',
}

export type AppStep = Step;

export interface Story {
  id: number;
  title: string;
  content: string;
}

export interface ScenePrompt {
  scene_number: number;
  scene_text: string;
  image_prompt: string;
  video_prompt: string;
}

export type ThemeName = keyof typeof themeColors;

export interface AIModel {
  id: string;
  name: string;
}

export interface AIConfig {
  provider: 'gemini' | 'openai';
  model: string;
}

export interface StoredApiKey {
  id: string;
  key: string; 
  masked: string;
}

export interface ApiKeyProviderStore {
  keys: StoredApiKey[];
  activeKeyId: string | null;
}

export interface ApiKeyStore {
  gemini: ApiKeyProviderStore;
  openai: ApiKeyProviderStore;
}

export interface Session {
  id: string;
  name: string;
  createdAt: string; // ISO string
  state: {
    step: AppStep;
    stories: Story[];
    selectedStory: Story | null;
    script: string;
    prompts: ScenePrompt[];
    userIdea: string;
    aiConfig: AIConfig | null;
    theme: ThemeName;
    aspectRatio: '9:16' | '16:9';
  };
}