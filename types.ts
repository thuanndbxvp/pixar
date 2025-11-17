import { themeColors } from "./themes";

export enum Step {
  IDEATION = 'IDEATION',
  STORY_SELECTION = 'STORY_SELECTION',
  STORY_EXPANSION = 'STORY_EXPANSION',
  STORY_EXPANDED = 'STORY_EXPANDED',
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
  expandedStory?: string;
  script?: string;
  prompts?: ScenePrompt[];
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

export type VisualStyleType = 'predefined' | 'analyzed' | 'custom' | 'character';

export interface VisualStyle {
  type: VisualStyleType;
  name: string;
  description: string;
  imageUrl?: string;
  id?: string; // Optional id for custom styles
}

export interface LibraryCharacter {
  id: string;
  name: string;
  species: string;
  detailedAppearance: string;
  visualStyleKeywords: string;
}

export interface StoredAnalyzedItem {
  id: string;
  name: string;
  description: string;
  type: 'custom_style' | 'custom_character';
}

export interface Session {
  id: string;
  name: string;
  createdAt: string; // ISO string
  state: {
    step: AppStep;
    stories: Story[];
    selectedStoryId: number | null;
    userIdea: string;
    aiConfig: AIConfig | null;
    theme: ThemeName;
    aspectRatio: '9:16' | '16:9';
    mood: string;
    visualStyle: VisualStyle;
    selectedCharacter: LibraryCharacter | null;
  };
}

export interface Toast {
  id: string;
  message: string;
  subMessage?: string;
  type: 'success' | 'error' | 'info';
}