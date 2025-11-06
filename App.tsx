import React, { useState, useCallback, useEffect } from 'react';
import * as geminiService from './services/geminiService';
import * as openaiService from './services/openaiService';
import type { Story, AppStep, ScenePrompt, ThemeName, AIConfig, Session } from './types';
import { Step } from './types';
import { themeColors } from './themes';
import StorySelection from './components/StorySelection';
import ScriptDisplay from './components/ScriptDisplay';
import PromptDisplay from './components/PromptDisplay';
import StepIndicator from './components/StepIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import ActionButton from './components/ActionButton';
import ApiKeyModal from './components/ApiKeyModal';
import LibraryModal from './components/LibraryModal';
import ThemePicker from './components/ThemePicker';
import { FilmIcon, SparklesIcon, Bars3BottomLeftIcon, PhotoIcon, KeyIcon, BookmarkSquareIcon, FolderOpenIcon, CheckIcon, ViewColumnsIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import { AI_MODELS } from './constants';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(Step.IDEATION);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState<AppStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userIdea, setUserIdea] = useState<string>('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [theme, setTheme] = useState<ThemeName>('sky');
  const [isJustSaved, setIsJustSaved] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('16:9');
  const [prevLoadingStep, setPrevLoadingStep] = useState<AppStep | null>(null);

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
    }
  }, []);

  useEffect(() => {
    loadAiConfig();
  }, [loadAiConfig]);

  useEffect(() => {
    const baseTitle = 'Trợ lý Sáng tạo Phim hoạt hình';
    if (loadingStep) {
        let message = 'AI đang suy nghĩ...';
        if (loadingStep === Step.IDEATION) message = 'Đang tạo ý tưởng...';
        if (loadingStep === Step.SCRIPT_GENERATION) message = 'Đang viết kịch bản...';
        if (loadingStep === Step.PROMPT_GENERATION) message = 'Đang tạo gợi ý...';
        document.title = `${message} | Trợ lý Sáng tạo`;
        setPrevLoadingStep(loadingStep);
    } else if (prevLoadingStep) {
        document.title = `✅ Hoàn thành! | Trợ lý Sáng tạo`;
        setPrevLoadingStep(null);
        setTimeout(() => {
            document.title = baseTitle;
        }, 3000);
    }
  }, [loadingStep, prevLoadingStep]);


  const handleApiModalSave = () => {
    loadAiConfig();
    setIsApiModalOpen(false);
  };

  const handleGenerateStories = useCallback(async () => {
    if (!aiConfig) return;
    setLoadingStep(Step.IDEATION);
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
      setLoadingStep(null);
    }
  }, [aiConfig]);

  const handleDevelopUserIdea = useCallback(async () => {
    if (!userIdea.trim() || !aiConfig) return;
    
    setLoadingStep(Step.IDEATION);
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
      setLoadingStep(null);
    }
  }, [userIdea, aiConfig]);

  const handleSelectStory = useCallback(async (story: Story) => {
    if (!aiConfig) return;
    
    setSelectedStoryId(story.id);

    // If script already exists for this story, just show it and don't call the API
    if (story.script) {
        setStep(Step.SCRIPT_GENERATED);
        return;
    }

    // Otherwise, generate the script
    setLoadingStep(Step.SCRIPT_GENERATION);
    setError(null);
    setStep(Step.SCRIPT_GENERATION);
    try {
        const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
        const expandedScript = await service.expandStoryAndCreateCast(story.content, aiConfig.model, aspectRatio);
        
        // Update the specific story in the stories array with the new script, and clear any old prompts
        setStories(prevStories => prevStories.map(s => 
            s.id === story.id ? { ...s, script: expandedScript, prompts: [] } : s
        ));
        
        setStep(Step.SCRIPT_GENERATED);
    } catch (err: any) {
        setError(`Không thể phát triển câu chuyện: ${err.message}. Vui lòng kiểm tra API key và cấu hình mô hình của bạn.`);
        console.error(err);
    } finally {
        setLoadingStep(null);
    }
}, [aiConfig, aspectRatio]);

const handleGeneratePrompts = useCallback(async () => {
    if (selectedStoryId === null || !aiConfig) return;
    
    const story = stories.find(s => s.id === selectedStoryId);
    if (!story || !story.script) return;
    
    setLoadingStep(Step.PROMPT_GENERATION);
    setError(null);
    setStep(Step.PROMPT_GENERATION);
    try {
        const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
        const visualPrompts = await service.generateVisualPrompts(story.script, aiConfig.model, aspectRatio);
        
        // Update the story with generated prompts
        setStories(prevStories => prevStories.map(s => 
            s.id === selectedStoryId ? { ...s, prompts: visualPrompts } : s
        ));

        setStep(Step.PROMPTS_GENERATED);
    } catch (err: any) {
        setError(`Không thể tạo gợi ý hình ảnh: ${err.message}. Vui lòng kiểm tra API key và cấu hình mô hình của bạn.`);
        console.error(err);
    } finally {
        setLoadingStep(null);
    }
}, [stories, selectedStoryId, aiConfig, aspectRatio]);
  
  const handleReset = () => {
    setStep(Step.IDEATION);
    setStories([]);
    setSelectedStoryId(null);
    setLoadingStep(null);
    setError(null);
    setUserIdea('');
    setAspectRatio('16:9');
  };

  const handleSaveSession = () => {
    if (selectedStoryId === null) {
      console.warn("Lưu phiên làm việc được gọi khi chưa có câu chuyện nào được chọn.");
      return;
    }

    const storyToGetName = stories.find(s => s.id === selectedStoryId);
    if (!storyToGetName) return;
    const sessionName = storyToGetName.title;

    const currentState = {
        step, stories, selectedStoryId, userIdea, aiConfig, theme, aspectRatio
    };
    
    const existingSessions: Session[] = JSON.parse(localStorage.getItem('animationStudioSessions') || '[]');
    
    const existingSessionIndex = existingSessions.findIndex(s => s.name === sessionName);

    let updatedSessions;

    if (existingSessionIndex > -1) {
        // Update existing session
        const updatedSession = {
            ...existingSessions[existingSessionIndex],
            state: currentState,
            createdAt: new Date().toISOString(), // Update timestamp
        };
        existingSessions[existingSessionIndex] = updatedSession;
        updatedSessions = existingSessions;
    } else {
        // Add new session
        const newSession: Session = {
            id: crypto.randomUUID(),
            name: sessionName,
            createdAt: new Date().toISOString(),
            state: currentState
        };
        updatedSessions = [newSession, ...existingSessions];
    }

    localStorage.setItem('animationStudioSessions', JSON.stringify(updatedSessions));
    
    setIsJustSaved(true);
    setTimeout(() => {
        setIsJustSaved(false);
    }, 2500);
  };

  const handleLoadSession = (session: Session) => {
    const s = session.state;
    setStep(s.step);
    setStories(s.stories);
    setSelectedStoryId(s.selectedStoryId);
    setUserIdea(s.userIdea);
    setAiConfig(s.aiConfig);
    setTheme(s.theme);
    setAspectRatio(s.aspectRatio || '16:9');
    setError(null);
    setLoadingStep(null);
    setIsLibraryModalOpen(false); // Close modal on load
  };

  const selectedStory = stories.find(s => s.id === selectedStoryId) || null;
  const script = selectedStory?.script || '';
  const prompts = selectedStory?.prompts || [];

  const handleStepNavigation = (stepIndex: number) => {
    if (stepIndex === 0) {
        setStep(Step.STORY_SELECTION);
    } else if (stepIndex === 1) {
        setStep(Step.SCRIPT_GENERATED);
    } else if (stepIndex === 2) {
        setStep(Step.PROMPTS_GENERATED);
    }
  };
  
  const currentTheme = themeColors[theme];
  const appStyle = {
    '--theme-400': currentTheme[400],
    '--theme-500': currentTheme[500],
    '--theme-600': currentTheme[600],
  } as React.CSSProperties;


  return (
    <div style={appStyle} className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-8">
          <div 
            onClick={handleReset}
            className="inline-block cursor-pointer group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleReset(); } }}
            aria-label="Start New Project"
          >
            <div className="flex items-center justify-center gap-3 group-hover:opacity-80 transition-opacity duration-300">
              <FilmIcon className="h-10 w-10 text-[var(--theme-400)] transform-gpu"/>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[var(--theme-400)] to-purple-500 text-transparent bg-clip-text">
                Animation Creation Assistant
              </h1>
            </div>
          </div>
          <p className="mt-4 text-lg text-gray-400">Đối tác AI của bạn để tạo phim hoạt hình ngắn phong cách Pixar.</p>
          
          <div className="flex justify-center items-center gap-2 mt-6">
             <button
                onClick={handleSaveSession}
                disabled={selectedStoryId === null || isJustSaved}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors font-medium ${
                    isJustSaved
                        ? 'bg-green-500/20 text-green-300 cursor-default'
                        : selectedStoryId === null
                        ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-200'
                }`}
                >
                {isJustSaved ? (
                    <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Đã lưu</span>
                    </>
                ) : (
                    <>
                    <BookmarkSquareIcon className="w-5 h-5" />
                    <span>Lưu Phiên</span>
                    </>
                )}
            </button>
              <button onClick={() => setIsLibraryModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg text-sm transition-colors">
               <FolderOpenIcon className="w-5 h-5"/>
               <span>Thư viện</span>
             </button>
            <button onClick={() => setIsApiModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg text-sm transition-colors">
               <KeyIcon className="w-5 h-5"/>
               <span>Quản lý API</span>
           </button>
           <ThemePicker selectedTheme={theme} onThemeChange={setTheme} />
        </div>
        </header>

        <ApiKeyModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} onSave={handleApiModalSave} />
        <LibraryModal isOpen={isLibraryModalOpen} onClose={() => setIsLibraryModalOpen(false)} onLoadSession={handleLoadSession} />

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/30 p-6 ring-1 ring-white/10">
          <StepIndicator 
            currentStep={step} 
            onStepClick={handleStepNavigation}
            canNavigateTo={[
                stories.length > 0,
                !!selectedStory?.script,
                !!selectedStory?.prompts && selectedStory.prompts.length > 0,
            ]}
           />

          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg my-4 ring-1 ring-red-500/30">{error}</div>}

          
            
              {step === Step.IDEATION && (
                <div className="text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="max-w-xs w-full">
                            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-2 text-center">Định dạng Khung hình</label>
                            <select
                                id="aspectRatio"
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value as '9:16' | '16:9')}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-[var(--theme-500)] focus:border-[var(--theme-500)]"
                            >
                                <option value="16:9">Ngang (16:9)</option>
                                <option value="9:16">Dọc (9:16)</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">BƯỚC 1</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>


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
                        disabled={!userIdea.trim() || loadingStep === Step.IDEATION}
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
                        disabled={loadingStep === Step.IDEATION}
                    />
                    {loadingStep === Step.IDEATION && <LoadingSpinner />}
                </div>
              )}

              {step === Step.STORY_SELECTION && (
                <StorySelection stories={stories} onSelect={handleSelectStory} />
              )}
              
              {(step === Step.SCRIPT_GENERATION || step === Step.SCRIPT_GENERATED) && (
                 <ScriptDisplay script={script} isLoading={loadingStep === Step.SCRIPT_GENERATION} storyTitle={selectedStory?.title || null} aiConfig={aiConfig} />
              )}
              
              {step === Step.SCRIPT_GENERATED && (
                  <div className="text-center mt-8">
                    <ActionButton onClick={handleGeneratePrompts} Icon={PhotoIcon} text="Tạo Gợi ý Hình ảnh" />
                  </div>
              )}

              {(step === Step.PROMPT_GENERATION || step === Step.PROMPTS_GENERATED) && (
                 <PromptDisplay prompts={prompts} isLoading={loadingStep === Step.PROMPT_GENERATION} storyTitle={selectedStory?.title || null} aiConfig={aiConfig} />
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
        </main>
      </div>
    </div>
  );
};

export default App;