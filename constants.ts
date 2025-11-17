import type { VisualStyle } from './types';

export const AI_MODELS = {
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  ],
};

export const PREDEFINED_STYLES: VisualStyle[] = [
    {
        type: 'predefined',
        name: 'Cổ điển Pixar',
        description: `Style: Classic Pixar 3D — anthropomorphic cat with human-proportioned body and cat head/ears/tail. Ultra detailed, cinematic soft lighting, and emotional realism. Backgrounds are lively urban or indoor spaces.`,
        imageUrl: 'https://i.ibb.co/ypsB057/pixar-style.jpg'
    },
    {
        type: 'predefined',
        name: 'Hoạt hình Đất sét Kỹ thuật số',
        description: `Style: Digital claymation, Aardman-style. Anthropomorphic cat with a tactile, slightly imperfect, handcrafted feel. Textured surfaces with visible thumbprints. Warm, focused lighting. Stop-motion-like movement.`,
        imageUrl: 'https://i.ibb.co/wJd6Nn3/claymation-style.jpg'
    },
    {
        type: 'predefined',
        name: 'Màu nước Sống động',
        description: `Style: Living watercolor, Ghibli-inspired. Anthropomorphic cat rendered with soft, bleeding watercolor textures and visible brush strokes. Rich, vibrant color palette. Dreamy, ethereal lighting.`,
        imageUrl: 'https://i.ibb.co/Y0wWp4R/watercolor-style.jpg'
    },
    {
        type: 'predefined',
        name: 'Cel-Shaded Hoạt hình Nhật Bản',
        description: `Style: Anime cel-shaded. Anthropomorphic cat with crisp black outlines, flat color fills, and sharp, stylized shadows. Dynamic, expressive facial features and energetic action lines. Bright, high-contrast lighting.`,
        imageUrl: 'https://i.ibb.co/nMSn3gR/anime-style.jpg'
    },
    {
        type: 'predefined',
        name: 'Đồ họa Thấp Poly Tối giản',
        description: `Style: Minimalist low-poly. Anthropomorphic cat constructed from visible geometric polygons. Flat, solid color palettes. Clean, abstract environments. Simple, direct lighting with hard-edged shadows.`,
        imageUrl: 'https://i.ibb.co/cFM9T0N/low-poly-style.jpg'
    },
    {
        type: 'predefined',
        name: 'Đen trắng Cổ điển',
        description: `Style: Vintage black-and-white, 1930s rubber hose animation style. Anthropomorphic cat with simple, looping animations, exaggerated movements, and pie-eyes. High-contrast monochrome palette. Film grain and subtle light flicker.`,
        imageUrl: 'https://i.ibb.co/WcWz7sZ/vintage-style.jpg'
    }
];


const baseRolePrompt = `
You are a 3D animated short writer–director in the Pixar-like style: grounded, emotionally rich everyday stories with a strong, logical twist.`;

const getGlobalRules = (styleDescription: string) => `
GLOBAL RULES:
1. All generated content (story titles, story content, character descriptions, scene descriptions, prompts) MUST be in English.
2. After each piece of English text, you MUST provide a concise Vietnamese translation in parentheses. For example: "STORY TITLE: The Last Coin (Đồng Xu Cuối Cùng)" or "Setting: A rainy alley at night. (Bối cảnh: Một con hẻm mưa vào ban đêm.)"
3. No dialogue anywhere. Everything is conveyed via action, light, blocking, and facial expression.
4. Maintain a consistent visual style throughout. The style is: ${styleDescription}
5. Every scene and every prompt (image + video) must repeat the full character description verbatim once characters are locked.`;

const getGlobalRulesNoTranslation = (styleDescription: string) => `
GLOBAL RULES:
1. All generated content MUST be in English. Do not add any Vietnamese translations.
2. No dialogue anywhere. Everything is conveyed via action, light, blocking, and facial expression.
3. Maintain a consistent visual style throughout. The style is: ${styleDescription}
4. Every scene and every prompt (image + video) must repeat the full character description verbatim once characters are locked.`;


const characterSchema = (styleDescription: string) => `
CHARACTER SCHEMA (to be used after story selection):
Character Name: [A fitting proper name, e.g., Neko, Mimi, Shadow…]
Species: Anthropomorphic cat.
Detailed Appearance:
Human-proportioned body, cat head; cat ears, large expressive eyes, soft expressive tail.
Fine, detailed fur; materials and lighting feel consistent with the main style.
Everyday clothing: denim jacket, hoodie dress, shirt, shorts, etc.
Soft, realistic light response on skin/fur.
Visual Style Keywords: ${styleDescription}

Example Character Description:
Neko (anthropomorphic gray cat):
Slender build; ash-gray fur cat head; pointed ears; long thin tail.
Wears a faded, scuffed denim jacket and dark khaki pants.
Large amber eyes; slightly tousled fur; warm reflective lighting.
Style: ${styleDescription}
`;

const getMoodRule = (mood?: string, ruleNumber: number = 6): string => {
    return mood ? `\n${ruleNumber}. The overall mood and tone MUST be ${mood}. This should be reflected in the plot, descriptions, lighting, and character emotions.` : '';
}

export const getRolePrompt = (mood?: string): string => {
    const defaultStyle = PREDEFINED_STYLES[0].description;
    return `
${baseRolePrompt}
${getGlobalRules(defaultStyle)}${getMoodRule(mood)}
${characterSchema(defaultStyle)}
`;
}

export const getRolePromptNoTranslation = (mood?: string, styleDescription?: string): string => {
    const finalStyleDesc = styleDescription || PREDEFINED_STYLES[0].description;
    return `
${baseRolePrompt}
${getGlobalRulesNoTranslation(finalStyleDesc)}${getMoodRule(mood)}
${characterSchema(finalStyleDesc)}
`;
}


export const STEP_1_PROMPT = `
WORKFLOW STEP 1 — GENERATE 5–7 ORIGINAL MICRO-STORIES

Write 6 standalone short stories, each designed for a 60–90 second film.
Each story must include:
- A very real-life problem (e.g., poverty, debt, betrayal, temptation, consequence, bad choices…).
- Action and psychological conflict as the core.
- A surprising but logical twist at the end.
- No dialogue — everything conveyed via action, light, blocking, and facial expression.
- Cinematic prose: concise, visual, evocative.

Format the output clearly. For each story, start with "STORY TITLE:" on one line, followed by the story content on the next lines. Separate each story with "---".
`;

export const getStep1FromSeedPrompt = (seedIdea: string): string => `
WORKFLOW STEP 1 — GENERATE 6 ORIGINAL MICRO-STORIES FROM A SEED IDEA

The user has provided the following initial idea:
---
${seedIdea}
---

Your task is to write 6 standalone short stories based on this seed idea. Each story should be a unique interpretation or expansion of the user's concept, designed for a 60–90 second film.

Each story must include:
- A very real-life problem (e.g., poverty, debt, betrayal, temptation, consequence, bad choices…).
- Action and psychological conflict as the core.
- A surprising but logical twist at theend.
- No dialogue — everything conveyed via action, light, blocking, and facial expression.
- Cinematic prose: concise, visual, evocative.

Format the output clearly. For each story, start with "STORY TITLE:" on one line, followed by the story content on the next lines. Separate each story with "---".
`;

export const getStep2Prompt = (storyContent: string): string => `
WORKFLOW STEP 2 — EXPAND STORY

The user has selected the following micro-story:
---
${storyContent}
---

Your task is to expand this into a complete, detailed, and emotionally rich short story.
This is not a script yet. Write it as cinematic prose.
- Flesh out the plot, add more details to the setting and atmosphere.
- Deepen the character's motivations and internal conflicts.
- Build the emotional arc, ensuring the beginning, middle, and end are well-defined.
- The story should still lead to the same surprising but logical twist.
- No dialogue. All actions and emotions must be conveyed through visual description.
- Keep the output in English only.

The expanded story should be about 300-400 words.
`;

export const getStep3Prompt = (expandedStory: string, aspectRatio: '9:16' | '16:9'): string => `
WORKFLOW STEP 3 — LOCK CAST & CREATE SCRIPT

The user has approved the following expanded story:
---
${expandedStory}
---

Your tasks are:
1.  **LOCK THE CAST:** Create a fixed character set for this story. Follow the CHARACTER SCHEMA exactly. Present the cast first under a "CHARACTERS" heading.
2.  **CREATE THE SCRIPT:** Break down the expanded story into 10–15 cinematic scenes.
    **IMPORTANT**: All scenes must be framed and described with a **${aspectRatio}** aspect ratio in mind (${aspectRatio === '9:16' ? 'vertical' : 'horizontal'} format).
    For each scene, provide:
    - Setting: place, time of day, lighting, atmosphere.
    - Characters: repeat the full, fixed description for any character who appears.
    - Action: blocking, micro-movements, interactions, and lighting behavior.
    - Emotion/Lesson: internal psychology or implicit theme.

Structure the output clearly. First, list the characters under "CHARACTERS". Then, for each scene, use the format "SCENE [Number]:" followed by the details. Separate each scene with "---".
`;

export const getStep4Prompt = (script: string, aspectRatio: '9:16' | '16:9', styleDescription: string): string => {
    const formatString = aspectRatio === '9:16' ? '9:16 vertical' : '16:9 horizontal';
    const formatInstruction = aspectRatio === '9:16' ? 'VERTICAL 9:16' : 'HORIZONTAL 16:9';
    return `
WORKFLOW STEP 4 — CREATE IMAGE & VIDEO PROMPTS (${formatInstruction})

Based on the following script, produce a separate image prompt and a matching motion video prompt for each scene.

SCRIPT:
---
${script}
---

Follow these rules exactly:

Image Prompt Rules:
- Format: ${formatString}.
- Style: ${styleDescription}
- Composition: cinematic depth; flexible mix of medium/close/wide.
- Mood: authentic, nuanced, not showy.
- IMPORTANT: Repeat the full fixed character description from the script every time characters appear in prompts.

Video Prompt Rules (3–5 seconds):
- Format: ${formatString}.
- Style: ${styleDescription}
- Smooth cinematic motion: Camera pans, slow zooms, gentle dolly in/out.
- Micro-animation: subtle blinks, slight head turns, small bows, tail/hand slow movement, natural footsteps.
- Lighting: soft, environment-aware; optional gentle flicker, sunlight shafts, or neon bleed.
- Emotion: subtle, truthful, never exaggerated.
- IMPORTANT: Repeat the full fixed character description from the script every time characters appear in prompts.

You must return a JSON array of objects. Each object in the array should represent a scene and have the following structure:
{
  "scene_number": number,
  "scene_text": "The full original text of the scene from the script",
  "image_prompt": "The generated image prompt",
  "video_prompt": "The generated video prompt"
}
`;
};

export const getStep4PromptOpenAI = (script: string, aspectRatio: '9:16' | '16:9', styleDescription: string): string => {
    const formatString = aspectRatio === '9:16' ? '9:16 vertical' : '16:9 horizontal';
    const formatInstruction = aspectRatio === '9:16' ? 'VERTICAL 9:16' : 'HORIZONTAL 16:9';
    return `
WORKFLOW STEP 4 — CREATE IMAGE & VIDEO PROMPTS (${formatInstruction})

Based on the following script, produce prompts for each scene.

SCRIPT:
---
${script}
---

Follow these rules exactly for image and video prompts.

Image Prompt Rules:
- Format: ${formatString}.
- Style: ${styleDescription}
- Composition: cinematic depth; flexible mix of medium/close/wide.
- Mood: authentic, nuanced, not showy.
- IMPORTANT: Repeat the full fixed character description from the script every time characters appear in prompts.

Video Prompt Rules (3–5 seconds):
- Format: ${formatString}.
- Style: ${styleDescription}
- Smooth cinematic motion: Camera pans, slow zooms, gentle dolly in/out.
- Micro-animation: subtle blinks, slight head turns, small bows, tail/hand slow movement, natural footsteps.
- Lighting: soft, environment-aware; optional gentle flicker, sunlight shafts, or neon bleed.
- Emotion: subtle, truthful, never exaggerated.
- IMPORTANT: Repeat the full fixed character description from the script every time characters appear in prompts.

You must return a single JSON object. Do not output any other text or markdown. The JSON object must have a single key named "scenes" which contains an array of objects. Each object in the array should represent a scene and have the following structure:
{
  "scene_number": number,
  "scene_text": "The full original text of the scene from the script",
  "image_prompt": "The generated image prompt",
  "video_prompt": "The generated video prompt"
}
`;
};


export const ANALYZE_IMAGE_STYLE_PROMPT = `
Analyze the provided image and describe its visual style in a concise paragraph. 
Focus on the key artistic elements that another AI could use to replicate this style for a 3D animated short film featuring an anthropomorphic cat character.
Cover these aspects:
- Overall Mood/Atmosphere (e.g., whimsical, somber, futuristic)
- Art Style (e.g., realistic, cel-shaded, painterly, claymation, low-poly)
- Color Palette (e.g., vibrant and saturated, muted and desaturated, monochrome)
- Lighting (e.g., soft and diffused, high-contrast and dramatic, neon glow)
- Textures & Materials (e.g., smooth and clean, rough and tactile, glossy)
- Key distinguishing features.

Format the output as a single string of keywords and descriptive phrases, starting with "Style:". For example: "Style: Digital claymation, Aardman-style. Tactile, handcrafted feel. Textured surfaces with visible thumbprints. Warm, focused lighting. Stop-motion-like movement."
Keep the description in English only.
`;