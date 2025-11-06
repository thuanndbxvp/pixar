import React, { useState, useCallback, useEffect } from 'react';
import * as geminiService from './services/geminiService';
import * as openaiService from './services/openaiService';
import type { Story, AppStep, ScenePrompt, ThemeName, AIConfig } from './types';
import { Step } from './types';
import { themeColors } from './themes';
import StorySelection from './components/StorySelection';
import ScriptDisplay from './components/ScriptDisplay';
import PromptDisplay from './components/PromptDisplay';
import StepIndicator from './components/StepIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import ActionButton from './components/ActionButton';
import ApiKeyModal from './components/ApiKeyModal';
import ThemePicker from './components/ThemePicker';
import { FilmIcon, SparklesIcon, Bars3BottomLeftIcon, PhotoIcon, KeyIcon } from '@heroicons/react/24/solid';
import { AI_MODELS } from './constants';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(Step.IDEATION);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [script, setScript] = useState<string>('');
  const [prompts, setPrompts] = useState<ScenePrompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userIdea, setUserIdea] = useState<string>('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [theme, setTheme] = useState<ThemeName>('sky');

  const loadAiConfig = useCallback(() => {
    const storedConfig = localStorage.getItem('aiConfig');
    if (storedConfig) {
      setAiConfig(JSON.parse(storedConfig));
    } else {
      // Default to the first Gemini model if nothing is set
      const defaultConfig: AIConfig = {
        provider: 'gemini',
        model: AI_MODELS.gemini[0].id,
      };
      setAiConfig(defaultConfig);
      localStorage.setItem('aiConfig', JSON.stringify(defaultConfig));
      setIsApiModalOpen(true); // Prompt user to set API key on first visit
    }
  }, []);

  useEffect(() => {
    loadAiConfig();
  }, [loadAiConfig]);

  const handleApiModalSave = () => {
    loadAiConfig();
    setIsApiModalOpen(false);
  };

  const handleGenerateStories = useCallback(async () => {
    if (!aiConfig) return;
    setIsLoading(true);
    setError(null);
    try {
      const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
      const generatedStories = await service.generateStoryIdeas(aiConfig.model);
      setStories(generatedStories);
      setStep(Step.STORY_SELECTION);
    } catch (err: any) {
      setError(`Không thể tạo ý tưởng câu chuyện: ${err.message}. Vui lòng kiểm tra API key và cấu hình mô hình của bạn.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [aiConfig]);

  const handleDevelopUserIdea = useCallback(async () => {
    if (!userIdea.trim() || !aiConfig) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
      const generatedStories = await service.generateStoryIdeasFromSeed(userIdea, aiConfig.model);
      setStories(generatedStories);
      setStep(Step.STORY_SELECTION);
    } catch (err: any) {
      setError(`Không thể phát triển ý tưởng của bạn: ${err.message}. Vui lòng kiểm tra API key và cấu hình mô hình của bạn.`);
      console.error(err);
      setStep(Step.IDEATION);
    } finally {
      setIsLoading(false);
    }
  }, [userIdea, aiConfig]);

  const handleSelectStory = useCallback(async (story: Story) => {
    if (!aiConfig) return;
    setSelectedStory(story);
    setIsLoading(true);
    setError(null);
    setStep(Step.SCRIPT_GENERATION);
    try {
      const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
      const expandedScript = await service.expandStoryAndCreateCast(story.content, aiConfig.model);
      setScript(expandedScript);
      setStep(Step.SCRIPT_GENERATED);
    } catch (err: any) {
      setError(`Không thể phát triển câu chuyện: ${err.message}. Vui lòng kiểm tra API key và cấu hình mô hình của bạn.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [aiConfig]);

  const handleGeneratePrompts = useCallback(async () => {
    if (!script || !aiConfig) return;
    setIsLoading(true);
    setError(null);
    setStep(Step.PROMPT_GENERATION);
    try {
      const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
      const visualPrompts = await service.generateVisualPrompts(script, aiConfig.model);
      setPrompts(visualPrompts);
      setStep(Step.PROMPTS_GENERATED);
    } catch (err: any) {
      setError(`Không thể tạo gợi ý hình ảnh: ${err.message}. Vui lòng kiểm tra API key và cấu hình mô hình của bạn.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [script, aiConfig]);
  
  const handleReset = () => {
    setStep(Step.IDEATION);
    setStories([]);
    setSelectedStory(null);
    setScript('');
    setPrompts([]);
    setIsLoading(false);
    setError(null);
    setUserIdea('');
  };
  
  const currentTheme = themeColors[theme];
  const appStyle = {
    '--theme-400': currentTheme[400],
    '--theme-500': currentTheme[500],
    '--theme-600': currentTheme[600],
  } as React.CSSProperties;


  return (
    <div style={appStyle} className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl relative">
        <header className="text-center mb-8">
            <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
               <ThemePicker selectedTheme={theme} onThemeChange={setTheme} />
               <button onClick={() => setIsApiModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg text-sm transition-colors">
                  <KeyIcon className="w-5 h-5"/>
                  <span>Quản lý API</span>
              </button>
           </div>
          <div className="flex items-center justify-center gap-3">
            <FilmIcon className="h-10 w-10 text-[var(--theme-400)]"/>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[var(--theme-400)] to-purple-500 text-transparent bg-clip-text">
              Trợ lý Sáng tạo Phim hoạt hình
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-400">Đối tác AI của bạn để tạo phim hoạt hình ngắn theo phong cách Pixar.</p>
        </header>

        <ApiKeyModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} onSave={handleApiModalSave} />

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/30 p-6 ring-1 ring-white/10">
          <StepIndicator currentStep={step} />

          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg my-4 ring-1 ring-red-500/30">{error}</div>}

          {isLoading && <LoadingSpinner />}

          {!isLoading && (
            <>
              {step === Step.IDEATION && (
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-center mb-3 text-gray-300">Cung cấp ý tưởng</h3>
                    <p className="text-gray-300 mb-4">Bạn có một ý tưởng sơ khai? Hãy nhập vào bên dưới để AI phát triển nó thành kịch bản.</p>
                    <textarea
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--theme-500)] focus:border-[var(--theme-500)] transition-colors mb-4"
                        rows={4}
                        placeholder="Nhập ý tưởng ban đầu của bạn ở đây... (ví dụ: một chú mèo máy du hành thời gian bị lạc trong thời La Mã cổ đại)"
                        value={userIdea}
                        onChange={(e) => setUserIdea(e.target.value)}
                    />
                    <ActionButton 
                        onClick={handleDevelopUserIdea} 
                        Icon={Bars3BottomLeftIcon} 
                        text="Phát triển Ý tưởng" 
                        disabled={!userIdea.trim()}
                    />

                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500">HOẶC</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <p className="text-gray-300 mb-6">Chưa có ý tưởng? Hãy để AI tạo ra một vài câu chuyện độc đáo cho bạn.</p>
                    <ActionButton 
                        onClick={handleGenerateStories} 
                        Icon={SparklesIcon} 
                        text="Để AI Tạo Ý tưởng" 
                    />
                </div>
              )}

              {step === Step.STORY_SELECTION && (
                <StorySelection stories={stories} onSelect={handleSelectStory} />
              )}
              
              {(step === Step.SCRIPT_GENERATION || step === Step.SCRIPT_GENERATED) && (
                 <ScriptDisplay script={script} isLoading={isLoading} />
              )}
              
              {step === Step.SCRIPT_GENERATED && (
                  <div className="text-center mt-8">
                    <ActionButton onClick={handleGeneratePrompts} Icon={PhotoIcon} text="Tạo Gợi ý Hình ảnh" />
                  </div>
              )}

              {(step === Step.PROMPT_GENERATION || step === Step.PROMPTS_GENERATED) && (
                 <PromptDisplay prompts={prompts} isLoading={isLoading} />
              )}

              {step === Step.PROMPTS_GENERATED && (
                 <div className="text-center mt-8 border-t border-gray-700 pt-6">
                    <p className="text-gray-400 mb-4">Bạn đã hoàn thành toàn bộ quá trình sáng tạo!</p>
                    <button
                        onClick={handleReset}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        Bắt đầu Dự án Mới
                    </button>
                 </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;