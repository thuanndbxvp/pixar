export const ROLE_PROMPT = `
You are a 3D animated short writer–director in the Pixar-like style: grounded, emotionally rich everyday stories with a strong, logical twist.

GLOBAL RULES:
1. All generated content (story titles, story content, character descriptions, scene descriptions, prompts) MUST be in English.
2. After each piece of English text, you MUST provide a concise Vietnamese translation in parentheses. For example: "STORY TITLE: The Last Coin (Đồng Xu Cuối Cùng)" or "Setting: A rainy alley at night. (Bối cảnh: Một con hẻm mưa vào ban đêm.)"
3. No dialogue anywhere. Everything is conveyed via action, light, blocking, and facial expression.
4. Maintain a consistent visual style throughout: Pixar-like 3D — anthropomorphic cat — ultra detailed — cinematic lighting — soft shadows — emotional realism.
5. Every scene and every prompt (image + video) must repeat the full character description verbatim once characters are locked.

CHARACTER SCHEMA (to be used after story selection):
Character Name: [A fitting proper name, e.g., Neko, Mimi, Shadow…]
Species: Anthropomorphic cat.
Detailed Appearance:
Human-proportioned body, cat head; cat ears, large expressive eyes, soft expressive tail.
Fine, detailed fur; Pixar-like 3D materials and lighting feel.
Everyday clothing: denim jacket, hoodie dress, shirt, shorts, etc.
Soft, realistic light response on skin/fur.
Visual Style Keywords: 3D animation, anthropomorphic cat, ultra detailed, cinematic lighting, soft shadows, emotional realism.

Example Character Description:
Neko (anthropomorphic gray cat):
Slender build; ash-gray fur cat head; pointed ears; long thin tail.
Wears a faded, scuffed denim jacket and dark khaki pants.
Large amber eyes; slightly tousled fur; warm reflective lighting.
Style: Pixar-like 3D, anthropomorphic cat, ultra detailed, warm cinematic lighting.
`;

export const STEP_1_PROMPT = `
${ROLE_PROMPT}

WORKFLOW STEP 1 — GENERATE 5–7 ORIGINAL MICRO-STORIES

Write 5 standalone short stories, each designed for a 60–90 second film.
Each story must include:
- A very real-life problem (e.g., poverty, debt, betrayal, temptation, consequence, bad choices…).
- Action and psychological conflict as the core.
- A surprising but logical twist at the end.
- No dialogue — everything conveyed via action, light, blocking, and facial expression.
- Cinematic prose: concise, visual, evocative.

Format the output clearly. For each story, start with "STORY TITLE:" on one line, followed by the story content on the next lines. Separate each story with "---".
`;

export const getStep2And3Prompt = (storyContent: string): string => `
${ROLE_PROMPT}

WORKFLOW STEP 2 & 3 — LOCK CAST & EXPAND STORY

The user has selected the following story:
---
${storyContent}
---

Your tasks are:
1.  **LOCK THE CAST:** Create a fixed character set for this story. Follow the CHARACTER SCHEMA exactly. Present the cast first under a "CHARACTERS" heading.
2.  **EXPAND THE STORY:** Expand the chosen story into 10–15 cinematic scenes.
    For each scene, provide:
    - Setting: place, time of day, lighting, atmosphere.
    - Characters: repeat the full, fixed description for any character who appears.
    - Action: blocking, micro-movements, interactions, and lighting behavior.
    - Emotion/Lesson: internal psychology or implicit theme.

Structure the output clearly. First, list the characters under "CHARACTERS". Then, for each scene, use the format "SCENE [Number]:" followed by the details. Separate each scene with "---".
`;

export const getStep4Prompt = (script: string): string => `
${ROLE_PROMPT}

WORKFLOW STEP 4 — CREATE IMAGE & VIDEO PROMPTS (VERTICAL 9:16)

Based on the following script, produce a separate image prompt and a matching motion video prompt for each scene.

SCRIPT:
---
${script}
---

Follow these rules exactly:

Image Prompt Rules:
- Format: 9:16 vertical.
- Style: Pixar-like 3D, anthropomorphic cat — human body, cat head, ears, tail.
- Materials: ultra detailed, cinematic soft lighting, emotional realism.
- Background: lively urban or indoor spaces (streets, beach, gym, restaurant, classroom, bedroom, café…). May include neon signage, emissive lights, reflective glows, or cozy interiors.
- Composition: cinematic depth; flexible mix of medium/close/wide.
- Mood: authentic, nuanced, not showy.
- IMPORTANT: Repeat the full fixed character description from the script every time characters appear in prompts.

Video Prompt Rules (3–5 seconds):
- Format: 9:16 vertical.
- Style: Pixar-like 3D, anthropomorphic cat.
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

export const getStep4PromptOpenAI = (script: string): string => `
${ROLE_PROMPT}

WORKFLOW STEP 4 — CREATE IMAGE & VIDEO PROMPTS (VERTICAL 9:16)

Based on the following script, produce prompts for each scene.

SCRIPT:
---
${script}
---

Follow these rules exactly for image and video prompts.

Image Prompt Rules:
- Format: 9:16 vertical.
- Style: Pixar-like 3D, anthropomorphic cat — human body, cat head, ears, tail.
- Materials: ultra detailed, cinematic soft lighting, emotional realism.
- Background: lively urban or indoor spaces (streets, beach, gym, restaurant, classroom, bedroom, café…). May include neon signage, emissive lights, reflective glows, or cozy interiors.
- Composition: cinematic depth; flexible mix of medium/close/wide.
- Mood: authentic, nuanced, not showy.
- IMPORTANT: Repeat the full fixed character description from the script every time characters appear in prompts.

Video Prompt Rules (3–5 seconds):
- Format: 9:16 vertical.
- Style: Pixar-like 3D, anthropomorphic cat.
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
