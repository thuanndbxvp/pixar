import type { VisualStyle, LibraryCharacter } from './types';

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
        description: `Style: Classic Pixar 3D — anthropomorphic character with human-proportioned body. Ultra detailed, cinematic soft lighting, and emotional realism. Backgrounds are lively urban or indoor spaces.`,
        imageUrl: 'https://i.postimg.cc/JyL97QrN/1-Phong-cach-Co-dien-Pixar.jpg'
    },
    {
        type: 'predefined',
        name: 'Hoạt hình Đất sét Kỹ thuật số',
        description: `Style: Digital claymation, Aardman-style. Anthropomorphic character with a tactile, slightly imperfect, handcrafted feel. Textured surfaces with visible thumbprints. Warm, focused lighting. Stop-motion-like movement.`,
        imageUrl: 'https://i.postimg.cc/hz46TP7h/2-Phong-cach-Hoat-hinh-Dat-set-Ky-thuat-so-(Aardman).jpg'
    },
    {
        type: 'predefined',
        name: 'Màu nước Sống động',
        description: `Style: Living watercolor, Ghibli-inspired. Anthropomorphic character rendered with soft, bleeding watercolor textures and visible brush strokes. Rich, vibrant color palette. Dreamy, ethereal lighting.`,
        imageUrl: 'https://i.postimg.cc/zbD6KXR7/3-Phong-cach-Mau-nuoc-Song-dong-(Ghibli-inspired-watercolor).jpg'
    },
    {
        type: 'predefined',
        name: 'Cel-Shaded Hoạt hình Nhật Bản',
        description: `Style: Anime cel-shaded. Anthropomorphic character with crisp black outlines, flat color fills, and sharp, stylized shadows. Dynamic, expressive facial features and energetic action lines. Bright, high-contrast lighting.`,
        imageUrl: 'https://i.postimg.cc/1nR2w5Np/4-Phong-cach-Cel-Shaded-Hoat-hinh-Nhat-Ban.jpg'
    },
    {
        type: 'predefined',
        name: 'Đồ họa Thấp Poly Tối giản',
        description: `Style: Minimalist low-poly. Anthropomorphic character constructed from visible geometric polygons. Flat, solid color palettes. Clean, abstract environments. Simple, direct lighting with hard-edged shadows.`,
        imageUrl: 'https://i.postimg.cc/gwH1x6rn/5-Phong-cach-Do-hoa-Thap-Poly-Toi-gian.jpg'
    },
    {
        type: 'predefined',
        name: 'Đen trắng Cổ điển',
        description: `Style: Vintage black-and-white, 1930s rubber hose animation style. Anthropomorphic character with simple, looping animations, exaggerated movements, and pie-eyes. High-contrast monochrome palette. Film grain and subtle light flicker.`,
        imageUrl: 'https://i.postimg.cc/G83VGhsy/6-Phong-cach-Den-trang-Co-dien-(1930s-Rubber-Hose).jpg'
    }
];

export const PREDEFINED_CHARACTERS: LibraryCharacter[] = [
    {
        id: 'char_milo',
        name: 'Milo',
        species: 'Anthropomorphic cat.',
        detailedAppearance: 'Một chú mèo nhỏ có bộ lông trắng pha xám, mắt tròn long lanh, dáng người nhỏ nhắn. Thường đeo một chiếc khăn quàng màu xanh nhạt. Biểu cảm giàu cảm xúc, đôi tai vểnh lên khi tò mò.',
        visualStyleKeywords: 'Pixar-style, soft 3D fur, expressive eyes, warm lighting, cute proportions.'
    },
    {
        id: 'char_peanut',
        name: 'Peanut',
        species: 'Anthropomorphic squirrel.',
        detailedAppearance: 'Sóc nhỏ có bộ lông nâu sáng, đuôi to bông xù. Thân hình nhanh nhẹn, hay đeo balo nhỏ đựng hạt. Khuôn mặt lanh lợi, luôn có nụ cười nghịch ngợm.',
        visualStyleKeywords: 'Pixar-inspired, energetic pose, fluffy tail, adventure vibe.'
    },
    {
        id: 'char_sunny',
        name: 'Sunny',
        species: 'Anthropomorphic dog.',
        detailedAppearance: 'Chó nhỏ lông vàng kem, dáng mũm mĩm. Đeo vòng cổ xanh lá, mắt to hiền hậu. Luôn đứng hơi khum người như muốn giúp đỡ ai đó.',
        visualStyleKeywords: 'Soft 3D style, gentle expression, rounded shapes, wholesome mood.'
    },
    {
        id: 'char_button',
        name: 'Button',
        species: 'Anthropomorphic rabbit.',
        detailedAppearance: 'Thỏ nhỏ lông trắng, tai dài rủ xuống khi ngại ngùng. Thường mặc áo hoodie màu pastel. Ánh mắt ngây thơ nhưng ẩn chứa quyết tâm.',
        visualStyleKeywords: 'Cute pastel palette, big ears, soft shading, gentle animation look.'
    },
    {
        id: 'char_finn',
        name: 'Finn',
        species: 'Anthropomorphic fox.',
        detailedAppearance: 'Cáo con lông cam đỏ, đuôi dài trắng ở chóp. Dáng mảnh, nhanh nhẹn. Mắt sắc nhưng tràn đầy tinh nghịch. Thường khoác áo khoác ngắn lửng.',
        visualStyleKeywords: 'Dynamic silhouette, vivid colors, sly expression, stylized fur.'
    },
    {
        id: 'char_sage',
        name: 'Sage',
        species: 'Anthropomorphic hedgehog.',
        detailedAppearance: 'Nhím nhỏ có gai mềm hình giọt nước, màu nâu nhạt. Đeo kính tròn, luôn cầm theo một cuốn sách. Dáng người hướng nội, trầm tĩnh.',
        visualStyleKeywords: 'Bookish vibe, round glasses, soft clay-like textures, warm tones.'
    },
    {
        id: 'char_pudding',
        name: 'Pudding',
        species: 'Anthropomorphic bear.',
        detailedAppearance: 'Gấu con lông nâu mật ong, thân hình tròn trịa đáng yêu. Luôn mang theo túi vải nhỏ đựng đồ ăn. Mặt hiền lành, mắt cười.',
        visualStyleKeywords: 'Soft chubby design, cozy colors, friendly expression, cottagecore vibe.'
    },
    {
        id: 'char_willow',
        name: 'Willow',
        species: 'Anthropomorphic sparrow.',
        detailedAppearance: 'Chim sẻ nhỏ, lông vàng nhạt. Cánh ngắn nhưng đầy năng lượng. Đeo dây buộc đầu nhỏ màu trắng. Ánh mắt chứa đầy hy vọng.',
        visualStyleKeywords: 'Light watercolor feel, feather detail, uplifting tone, airy atmosphere.'
    },
    {
        id: 'char_chroma',
        name: 'Chroma',
        species: 'Anthropomorphic chameleon.',
        detailedAppearance: 'Tắc kè hoa nhỏ có làn da chuyển màu theo cảm xúc. Mắt to tròn, đeo tạp dề màu sơn vì mê vẽ tranh. Dáng người mảnh, linh hoạt.',
        visualStyleKeywords: 'Color-shifting textures, artistic vibe, playful palette, stylized anatomy.'
    },
    {
        id: 'char_moss',
        name: 'Moss',
        species: 'Anthropomorphic turtle.',
        detailedAppearance: 'Rùa nhỏ mai xanh rêu, đeo túi da chéo. Dáng chậm rãi nhưng ánh mắt thông thái. Mai có hoa văn xoắn nhẹ.',
        visualStyleKeywords: 'Calm tone, earthy palette, wise expression, smooth 3D shading.'
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
Character Name: [A fitting proper name, e.g., Buster, Pip, Sparky…]
Species: [The species of the character as identified from the story, e.g., Anthropomorphic dog, Elephant, Chicken, Tiny Robot]
Detailed Appearance:
Human-proportioned body with species-appropriate head, ears, tail, etc.
Large expressive eyes, soft expressive features.
Fine, detailed fur/skin/feathers/metal; materials and lighting feel consistent with the main style.
Everyday clothing: denim jacket, hoodie dress, shirt, shorts, etc.
Soft, realistic light response on skin/fur/surface.
Visual Style Keywords: ${styleDescription}

Example Character Description:
Buster (anthropomorphic beagle dog):
Stocky build; brown and white fur; long floppy ears; short, excited tail.
Wears a worn red collar but no other clothes.
Large, curious brown eyes; slightly damp fur from the rain; warm reflective lighting.
Style: ${styleDescription}
`;

const getMoodRule = (mood?: string, ruleNumber: number = 6): string => {
    return mood ? `\n${ruleNumber}. The overall mood and tone MUST be ${mood}. This should be reflected in the plot, descriptions, lighting, and character emotions.` : '';
}

export const getRolePrompt = (): string => {
    const defaultStyle = PREDEFINED_STYLES[0].description;
    return `
${baseRolePrompt}
${getGlobalRules(defaultStyle)}
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


export const getStep1Prompt = (count: number, mood: string): string => `
WORKFLOW STEP 1 — GENERATE ${count} ORIGINAL MICRO-STORIES

**CRITICAL INSTRUCTION: The overall mood and tone for ALL stories MUST be "${mood}".** This is the most important requirement and must be reflected in the plot, events, character emotions, and final twist of every story you generate.

Your main task is to write ${count} standalone short stories, each designed for a 60–90 second film.
Each story must include:
- A very real-life problem (e.g., poverty, debt, betrayal, temptation, consequence, bad choices…).
- Action and psychological conflict as the core.
- A surprising but logical twist at the end.
- No dialogue — everything conveyed via action, light, blocking, and facial expression.
- Cinematic prose: concise, visual, evocative.
- The main character can be any kind of animal or creature.

Format the output clearly. For each story, start with "STORY TITLE:" on one line, followed by the story content on the next lines. Separate each story with "---".
`;

export const getStep1FromSeedPrompt = (seedIdea: string, count: number, mood: string): string => `
WORKFLOW STEP 1 — GENERATE ${count} ORIGINAL MICRO-STORIES FROM A SEED IDEA

**CRITICAL INSTRUCTION: The overall mood and tone for ALL stories MUST be "${mood}".** This is the most important requirement and must be reflected in how you interpret the user's idea and develop the plot, character emotions, and final twist of every story you generate.

The user has provided the following initial idea:
---
${seedIdea}
---

Your main task is to write ${count} standalone short stories based on this seed idea. Each story should be a unique interpretation or expansion of the user's concept, designed for a 60–90 second film.

Each story must include:
- A very real-life problem (e.g., poverty, debt, betrayal, temptation, consequence, bad choices…).
- Action and psychological conflict as the core.
- A surprising but logical twist at theend.
- No dialogue — everything conveyed via action, light, blocking, and facial expression.
- Cinematic prose: concise, visual, evocative.
- The main character can be any kind of animal or creature that fits the theme.

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

export const getStep3Prompt = (expandedStory: string, aspectRatio: '9:16' | '16:9', visualStyle: VisualStyle, selectedCharacter: LibraryCharacter | null): string => {
    let characterDefinitionInstruction: string;

    if (selectedCharacter) {
        const characterDescription = `Character Name: ${selectedCharacter.name}\nSpecies: ${selectedCharacter.species}\nDetailed Appearance: ${selectedCharacter.detailedAppearance}\nVisual Style Keywords: ${selectedCharacter.visualStyleKeywords}`;
        characterDefinitionInstruction = `
1.  **USE PREDEFINED CHARACTER:**
    - The user has selected a character. You MUST use the following character definition exactly as provided. The story should be adapted to feature this character as the protagonist.
    - Present this character under a "CHARACTERS" heading. This cast is now LOCKED.

CHARACTER DEFINITION TO USE:
---
${characterDescription}
---
        `;
    } else {
        characterDefinitionInstruction = `
1.  **ANALYZE & DEFINE THE CHARACTER(S):**
    - Carefully read the expanded story to identify the main character(s).
    - Determine their species (e.g., dog, elephant, chicken, robot etc.) based on the narrative.
    - For each character, create a detailed description using the provided CHARACTER SCHEMA. The 'Species' field MUST be filled in based on your analysis of the story. The 'Visual Style Keywords' MUST align with the overall style: ${visualStyle.description}.
    - Present the final cast first under a "CHARACTERS" heading. This cast is now LOCKED and must be used consistently.
        `;
    }

    return `
WORKFLOW STEP 3 — DEFINE CHARACTER & CREATE SCRIPT

The user has approved the following expanded story:
---
${expandedStory}
---

Your tasks are, in this exact order:
${characterDefinitionInstruction}

2.  **CREATE THE SCRIPT:**
    - After defining the character(s), break down the expanded story into 10–15 cinematic scenes.
    - **IMPORTANT**: All scenes must be framed and described with a **${aspectRatio}** aspect ratio in mind (${aspectRatio === '9:16' ? 'vertical' : 'horizontal'} format).
    - For each scene, provide:
        - Setting: place, time of day, lighting, atmosphere.
        - Characters: repeat the full, locked description for any character who appears.
        - Action: blocking, micro-movements, interactions, and lighting behavior.
        - Emotion/Lesson: internal psychology or implicit theme.

Structure the output clearly. First, list the characters under "CHARACTERS". Then, for each scene, use the format "SCENE [Number]:" followed by the details. Separate each scene with "---".
`;
};

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


export const getAnalyzeImagePrompt = (options: { style: boolean; character: boolean }): string => {
    const styleInstruction = `
- **Overall Mood/Atmosphere:** e.g., whimsical, somber, futuristic
- **Art Style:** e.g., realistic, cel-shaded, painterly, claymation, low-poly
- **Color Palette:** e.g., vibrant and saturated, muted and desaturated, monochrome
- **Lighting:** e.g., soft and diffused, high-contrast and dramatic, neon glow
- **Textures & Materials:** e.g., smooth and clean, rough and tactile, glossy
- **Key distinguishing features.**
`;

    if (options.character && options.style) {
        return `
You are an expert character designer and art director for 3D animation. Analyze the provided image for BOTH its artistic style and the main character present.
Your goal is to create a complete, unified character description that follows the CHARACTER SCHEMA below.
You MUST integrate the overall artistic style of the image (mood, palette, lighting, textures) into the 'Visual Style Keywords' field of the schema.
The final output MUST be a single block of text that starts with 'Character Name:' and adheres strictly to the schema format. Do not add any extra explanations.
Keep the output in English only.

CHARACTER SCHEMA:
Character Name: [A fitting proper name]
Species: [e.g., Anthropomorphic fox, Tiny Robot]
Detailed Appearance: [Describe the character's body, head, features, clothing, etc., as seen in the image]
Visual Style Keywords: [Combine the analyzed artistic style (mood, lighting, textures) with character-specific keywords]
`;
    } else if (options.character) {
        return `
You are an expert character designer for 3D animation. Analyze the main character in the provided image.
Your goal is to create a character description that follows the CHARACTER SCHEMA below. Fill in all fields based on the visual information in the image.
The final output MUST be a single block of text that starts with 'Character Name:' and adheres strictly to the schema format. Do not add any extra explanations.
Keep the output in English only.

CHARACTER SCHEMA:
Character Name: [A fitting proper name]
Species: [e.g., Anthropomorphic fox, Tiny Robot]
Detailed Appearance: [Describe the character's body, head, features, clothing, etc., as seen in the image]
Visual Style Keywords: [List keywords that describe the character's specific look, e.g., soft fur, expressive eyes, worn leather jacket]
`;
    } else { // style only
        return `
You are an expert art director for 3D animation. Analyze the provided image and describe its visual style in a concise paragraph.
Focus on the key artistic elements that another AI could use to replicate this style for a 3D animated short film. Cover these aspects:
${styleInstruction}
Format the output as a single string of keywords and descriptive phrases, starting with "Style:". For example: "Style: Digital claymation, Aardman-style. Tactile, handcrafted feel. Textured surfaces with visible thumbprints. Warm, focused lighting. Stop-motion-like movement."
Keep the description in English only.
`;
    }
};