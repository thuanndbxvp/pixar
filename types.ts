
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
