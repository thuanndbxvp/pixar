import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as geminiService from './services/geminiService';
import * as openaiService from './services/openaiService';
import type { Story, AppStep, ScenePrompt, ThemeName, AIConfig, Session, Toast, VisualStyle, LibraryCharacter } from './types';
import { Step } from './types';
import { themeColors } from './themes';
import StorySelection from './components/StorySelection';
import StoryDisplay from './components/StoryDisplay';
import ScriptDisplay from './components/ScriptDisplay';
import PromptDisplay from './components/PromptDisplay';
import StepIndicator from './components/StepIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import ActionButton from './components/ActionButton';
import ApiKeyModal from './components/ApiKeyModal';
import LibraryModal from './components/LibraryModal';
import StyleModal from './components/StyleModal';
import ThemePicker from './components/ThemePicker';
import ToastContainer from './components/ToastContainer';
import { FilmIcon, SparklesIcon, Bars3BottomLeftIcon, PhotoIcon, KeyIcon, BookmarkSquareIcon, FolderOpenIcon, ViewColumnsIcon, ArrowUpTrayIcon, PaintBrushIcon } from '@heroicons/react/24/solid';
import { AI_MODELS, PREDEFINED_STYLES } from './constants';

const moodOptions = [
  { value: 'Inspirational', label: 'Truyền cảm hứng' },
  { value: 'Emotional / Heartwarming', label: 'Cảm động / Xúc động' },
  { value: 'Joyful / Humorous', label: 'Vui tươi / Hài hước' },
  { value: 'Sad / Melancholic', label: 'Buồn bã / U sầu' },
  { value: 'Dramatic', label: 'Kịch tính' },
  { value: 'Romantic', label: 'Lãng mạn' },
  { value: 'Suspenseful / Tense', label: 'Hồi hộp / Căng thẳng' },
  { value: 'Dark / Grim', label: 'Tăm tối / U ám' },
  { value: 'Fantasy / Dreamy', label: 'Kỳ ảo / Mộng mị' },
  { value: 'Calm / Serene', label: 'Bình yên / Chậm rãi' },
];

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(Step.IDEATION);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState<AppStep | null>(null);
  const [userIdea, setUserIdea] = useState<string>('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [theme, setTheme] = useState<ThemeName>('sky');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('16:9');
  const [prevLoadingStep, setPrevLoadingStep] = useState<AppStep | null>(null);
  const [mood, setMood] = useState<string>(moodOptions[2].value);
  const [uploadedScript, setUploadedScript] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(PREDEFINED_STYLES[0]);
  const [selectedCharacter, setSelectedCharacter] = useState<LibraryCharacter | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFromUserSeed, setIsFromUserSeed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeToast = (id: string) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  };

  const addToast = (message: string, subMessage: string = '', type: Toast['type'] = 'error') => {
    const id = crypto.randomUUID();
    const newToast: Toast = { id, message, subMessage, type };
    // Add new toast to the top, and limit the number of toasts
    setToasts(currentToasts => [newToast, ...currentToasts].slice(0, 5));
  };

  const handleApiError = (err: any, context: string) => {
    console.error(`Error during ${context}:`, err);
    let mainMessage = `Không thể ${context}`;
    let subMessage = "Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại.";

    if (err instanceof Error && err.message) {
      if (err.message.includes("API Key chưa được kích hoạt")) {
        mainMessage = 'Lỗi Xác thực API';
        subMessage = 'Key của bạn chưa được kích hoạt hoặc không hợp lệ. Vui lòng kiểm tra trong Quản lý API.';
      } else if (err.message.toLowerCase().includes("failed to communicate")) {
        mainMessage = 'Lỗi Kết nối API';
        subMessage = 'Không thể kết nối đến dịch vụ AI. Kiểm tra lại kết nối mạng và API key.';
      } else if (err.message.toLowerCase().includes("parse its json response")) {
        mainMessage = 'Lỗi Dữ liệu Trả về';
        subMessage = 'AI đã trả về định dạng không hợp lệ. Vui lòng thử lại sau giây lát.';
      } else {
        subMessage = err.message;
      }
    }
    addToast(mainMessage, subMessage, 'error');
  };

  const loadAiConfig = useCallback(() => {
    const storedConfig = localStorage.getItem('aiConfig');
    if (storedConfig) {
      setAiConfig(JSON.parse(storedConfig));
    } else {
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
        if (loadingStep === Step.STORY_EXPANSION) message = 'Đang viết câu chuyện...';
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
    setIsFromUserSeed(false);
    try {
      const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
      const generatedStories = await service.generateStoryIdeas(aiConfig.model, mood, 2);
      setStories(generatedStories);
      setStep(Step.STORY_SELECTION);
    } catch (err: any) {
      handleApiError(err, 'tạo ý tưởng câu chuyện');
    } finally {
      setLoadingStep(null);
    }
  }, [aiConfig, mood]);

  const handleDevelopUserIdea = useCallback(async () => {
    if (!userIdea.trim() || !aiConfig) return;
    
    setLoadingStep(Step.IDEATION);
    setIsFromUserSeed(true);
    try {
      const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
      const generatedStories = await service.generateStoryIdeasFromSeed(userIdea, aiConfig.model, mood, 2);
      setStories(generatedStories);
      setStep(Step.STORY_SELECTION);
    } catch (err: any) {
      handleApiError(err, 'phát triển ý tưởng của bạn');
      setStep(Step.IDEATION);
    } finally {
      setLoadingStep(null);
    }
  }, [userIdea, aiConfig, mood]);
  
  const handleLoadMoreStories = useCallback(async () => {
    if (!aiConfig) return;
    setIsLoadingMore(true);
    try {
      const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
      let newStories: Story[];
      if (isFromUserSeed) {
        newStories = await service.generateStoryIdeasFromSeed(userIdea, aiConfig.model, mood, 2);
      } else {
        newStories = await service.generateStoryIdeas(aiConfig.model, mood, 2);
      }

      const mappedNewStories = newStories.map((story, index) => ({
        ...story,
        id: stories.length + index,
      }));

      setStories(prevStories => [...prevStories, ...mappedNewStories]);

    } catch (err: any) {
      handleApiError(err, 'tải thêm ý tưởng');
    } finally {
      setIsLoadingMore(false);
    }
  }, [aiConfig, mood, isFromUserSeed, userIdea, stories.length]);

  const handleSelectStory = useCallback(async (story: Story) => {
    if (!aiConfig) return;
    
    setSelectedStoryId(story.id);

    if (story.expandedStory) {
        setStep(Step.STORY_EXPANDED);
        return;
    }

    setLoadingStep(Step.STORY_EXPANSION);
    setStep(Step.STORY_EXPANSION);
    try {
        const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
        const expandedStoryContent = await service.expandStory(story.content, aiConfig.model, mood);
        
        setStories(prevStories => prevStories.map(s => 
            s.id === story.id ? { ...s, expandedStory: expandedStoryContent, script: '', prompts: [] } : s
        ));
        
        setStep(Step.STORY_EXPANDED);
    } catch (err: any) {
        handleApiError(err, 'phát triển câu chuyện');
    } finally {
        setLoadingStep(null);
    }
  }, [aiConfig, mood]);

  const handleGenerateScript = useCallback(async () => {
    if (selectedStoryId === null || !aiConfig) return;
    
    const story = stories.find(s => s.id === selectedStoryId);
    if (!story || !story.expandedStory) return;

    setLoadingStep(Step.SCRIPT_GENERATION);
    setStep(Step.SCRIPT_GENERATION);
    try {
        const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
        const generatedScript = await service.createScriptFromStory(story.expandedStory, aiConfig.model, aspectRatio, mood, visualStyle, selectedCharacter);
        
        setStories(prevStories => prevStories.map(s => 
            s.id === selectedStoryId ? { ...s, script: generatedScript, prompts: [] } : s
        ));

        setStep(Step.SCRIPT_GENERATED);
    } catch (err: any) {
        handleApiError(err, 'tạo kịch bản');
    } finally {
        setLoadingStep(null);
    }
  }, [stories, selectedStoryId, aiConfig, aspectRatio, mood, visualStyle, selectedCharacter]);

  const handleGeneratePrompts = useCallback(async () => {
    if (selectedStoryId === null || !aiConfig) return;
    
    const story = stories.find(s => s.id === selectedStoryId);
    if (!story || !story.script) return;
    
    setLoadingStep(Step.PROMPT_GENERATION);
    setStep(Step.PROMPT_GENERATION);
    try {
        const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
        const visualPrompts = await service.generateVisualPrompts(story.script, aiConfig.model, aspectRatio, mood, visualStyle.description);
        
        setStories(prevStories => prevStories.map(s => 
            s.id === selectedStoryId ? { ...s, prompts: visualPrompts } : s
        ));

        setStep(Step.PROMPTS_GENERATED);
    } catch (err: any) {
        handleApiError(err, 'tạo gợi ý hình ảnh');
    } finally {
        setLoadingStep(null);
    }
  }, [stories, selectedStoryId, aiConfig, aspectRatio, mood, visualStyle]);
  
  const handleReset = () => {
    setStep(Step.IDEATION);
    setStories([]);
    setSelectedStoryId(null);
    setLoadingStep(null);
    setToasts([]);
    setUserIdea('');
    setAspectRatio('16:9');
    setMood(moodOptions[2].value);
    setUploadedScript('');
    setUploadedFileName('');
    setVisualStyle(PREDEFINED_STYLES[0]);
    setSelectedCharacter(null);
    setIsLoadingMore(false);
    setIsFromUserSeed(false);
  };

  const handleSaveSession = () => {
    if (selectedStoryId === null) {
      addToast("Không thể lưu", "Vui lòng chọn hoặc tạo một câu chuyện trước.", "info");
      return;
    }

    const storyToGetName = stories.find(s => s.id === selectedStoryId);
    if (!storyToGetName) return;
    const sessionName = storyToGetName.title;

    const currentState = {
        step, stories, selectedStoryId, userIdea, aiConfig, theme, aspectRatio, mood, visualStyle, selectedCharacter
    };
    
    const existingSessions: Session[] = JSON.parse(localStorage.getItem('animationStudioSessions') || '[]');
    
    const existingSessionIndex = existingSessions.findIndex(s => s.name === sessionName);

    let updatedSessions;

    if (existingSessionIndex > -1) {
        const updatedSession = {
            ...existingSessions[existingSessionIndex],
            state: currentState,
            createdAt: new Date().toISOString(),
        };
        existingSessions[existingSessionIndex] = updatedSession;
        updatedSessions = existingSessions;
    } else {
        const newSession: Session = {
            id: crypto.randomUUID(),
            name: sessionName,
            createdAt: new Date().toISOString(),
            state: currentState
        };
        updatedSessions = [newSession, ...existingSessions];
    }

    localStorage.setItem('animationStudioSessions', JSON.stringify(updatedSessions));
    addToast('Lưu thành công!', `Phiên "${sessionName}" đã được lưu vào thư viện.`, 'success');
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
    setMood(s.mood || moodOptions[2].value);
    setVisualStyle(s.visualStyle || PREDEFINED_STYLES[0]);
    setSelectedCharacter(s.selectedCharacter || null);
    setToasts([]);
    setLoadingStep(null);
    setIsLibraryModalOpen(false);
    addToast('Tải thành công!', `Đã tải phiên làm việc "${session.name}".`, 'success');
  };

  const selectedStory = stories.find(s => s.id === selectedStoryId) || null;
  const script = selectedStory?.script || '';
  const prompts = selectedStory?.prompts || [];

  const handleStepNavigation = (stepIndex: number) => {
    if (stepIndex === 0) {
        setStep(Step.STORY_SELECTION);
    } else if (stepIndex === 1) {
        setStep(Step.STORY_EXPANDED);
    } else if (stepIndex === 2) {
        setStep(Step.SCRIPT_GENERATED);
    } else if (stepIndex === 3) {
        setStep(Step.PROMPTS_GENERATED);
    }
  };

  const handleScriptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setUploadedScript(text);
            setUploadedFileName(file.name);
        };
        reader.readAsText(file);
    } else {
        addToast("Tệp không hợp lệ", "Vui lòng tải lên một tệp .txt hợp lệ.", "error");
        setUploadedScript('');
        setUploadedFileName('');
    }
  };

  const handleUseUploadedScript = useCallback(async () => {
    if (!uploadedScript.trim()) return;
    
    const title = uploadedFileName || 'Kịch bản tùy chỉnh';
    const newStory: Story = {
        id: 0,
        title: title,
        content: `Kịch bản được cung cấp bởi người dùng: ${title}`,
        expandedStory: `Kịch bản được cung cấp bởi người dùng: ${title}`,
        script: uploadedScript,
        prompts: []
    };

    setStories([newStory]);
    setSelectedStoryId(newStory.id);
    setStep(Step.SCRIPT_GENERATED);
  }, [uploadedScript, uploadedFileName]);
  
  const handleDirectorSave = (newStyle: VisualStyle, newCharacter: LibraryCharacter | null) => {
    setVisualStyle(newStyle);
    setSelectedCharacter(newCharacter);
    setIsStyleModalOpen(false);
    
    addToast('Lưu cài đặt đạo diễn!', `Đã áp dụng phong cách "${newStyle.name}".`, 'success');
    if (newCharacter) {
        addToast('Nhân vật đã được chọn', `Nhân vật "${newCharacter.name}" sẽ được sử dụng.`, 'info');
    } else {
        addToast('Nhân vật sẽ do AI tạo', 'AI sẽ tự động tạo nhân vật dựa trên câu chuyện.', 'info');
    }
  }

  const currentTheme = themeColors[theme];
  const appStyle = {
    '--theme-400': currentTheme[400],
    '--theme-500': currentTheme[500],
    '--theme-600': currentTheme[600],
  } as React.CSSProperties;


  return (
    <div style={appStyle} className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
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
          <p className="mt-4 text-lg text-gray-400">Đối tác AI của bạn để tạo phim hoạt hình ngắn.</p>
          
          <div className="flex justify-center items-center gap-2 mt-6">
             <button
                onClick={handleSaveSession}
                disabled={selectedStoryId === null}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors font-medium ${
                    selectedStoryId === null
                        ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-200'
                }`}
                >
                <BookmarkSquareIcon className="w-5 h-5" />
                <span>Lưu Phiên</span>
            </button>
              <button onClick={() => setIsLibraryModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg text-sm transition-colors">
               <FolderOpenIcon className="w-5 h-5"/>
               <span>Thư viện</span>
             </button>
             <button onClick={() => setIsStyleModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg text-sm transition-colors">
               <PaintBrushIcon className="w-5 h-5"/>
               <span>Đạo diễn</span>
             </button>
            <button onClick={() => setIsApiModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg text-sm transition-colors">
               <KeyIcon className="w-5 h-5"/>
               <span>Quản lý API</span>
           </button>
           <ThemePicker selectedTheme={theme} onThemeChange={setTheme} />
        </div>
        </header>

        <ApiKeyModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} onSave={handleApiModalSave} addToast={addToast} />
        <LibraryModal isOpen={isLibraryModalOpen} onClose={() => setIsLibraryModalOpen(false)} onLoadSession={handleLoadSession} />
        <StyleModal 
            isOpen={isStyleModalOpen} 
            onClose={() => setIsStyleModalOpen(false)}
            onSave={handleDirectorSave}
            currentStyle={visualStyle}
            currentCharacter={selectedCharacter}
            aiConfig={aiConfig}
            addToast={addToast}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
        />

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/30 p-6 ring-1 ring-white/10">
          <StepIndicator 
            currentStep={step} 
            onStepClick={handleStepNavigation}
            canNavigateTo={[
                stories.length > 0,
                !!selectedStory?.expandedStory,
                !!selectedStory?.script,
                !!selectedStory?.prompts && selectedStory.prompts.length > 0,
            ]}
           />
            
              {step === Step.IDEATION && (
                 <div>
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">BƯỚC 1: CUNG CẤP Ý TƯỞNG</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start mt-6">
                        {/* Left Column: Generate Idea */}
                        <div className="text-center bg-gray-900/50 p-6 rounded-lg ring-1 ring-gray-700 h-full flex flex-col">
                            <h3 className="text-lg font-semibold text-center mb-2 text-gray-200">Phát triển ý tưởng với AI</h3>
                            <p className="text-gray-400 mb-4 text-sm">Cung cấp ý tưởng, chọn cảm xúc, và để AI phát triển thành câu chuyện.</p>
                            
                            <div className="mb-4">
                                <label htmlFor="mood" className="block text-sm font-medium text-gray-300 mb-2">Cảm xúc câu chuyện</label>
                                <select id="mood" value={mood} onChange={(e) => setMood(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-[var(--theme-500)] focus:border-[var(--theme-500)]">
                                    {moodOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <textarea
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--theme-500)] focus:border-[var(--theme-500)] transition-colors mb-4"
                                rows={3}
                                placeholder="Nhập ý tưởng ban đầu của bạn ở đây..."
                                value={userIdea}
                                onChange={(e) => setUserIdea(e.target.value)}
                            />
                            <div className="mb-4">
                               <ActionButton 
                                    onClick={handleDevelopUserIdea} 
                                    Icon={Bars3BottomLeftIcon} 
                                    text="Phát triển Ý tưởng" 
                                    disabled={!userIdea.trim() || loadingStep === Step.IDEATION}
                                />
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-700"></div>
                                <span className="flex-shrink mx-4 text-gray-500 text-xs">HOẶC</span>
                                <div className="flex-grow border-t border-gray-700"></div>
                            </div>
                            <p className="text-gray-400 my-2 text-sm">Chưa có ý tưởng? Hãy để AI tạo ra một vài câu chuyện độc đáo cho bạn.</p>
                            <ActionButton 
                                onClick={handleGenerateStories} 
                                Icon={SparklesIcon} 
                                text="Để AI Tạo Ý tưởng"
                                disabled={loadingStep === Step.IDEATION}
                            />
                        </div>

                        {/* Right Column: Upload Script */}
                        <div className="text-center bg-gray-900/50 p-6 rounded-lg ring-1 ring-gray-700 h-full flex flex-col">
                            <h3 className="text-lg font-semibold text-center mb-2 text-gray-200">Sử dụng kịch bản có sẵn</h3>
                            <p className="text-gray-400 mb-4 text-sm">Nhập hoặc tải lên một kịch bản (.txt) để đi thẳng đến bước tạo gợi ý hình ảnh.</p>
                            
                            <input type="file" accept=".txt" onChange={handleScriptUpload} className="hidden" ref={fileInputRef}/>
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="w-full flex items-center justify-center gap-2 text-center px-4 py-3 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg text-sm transition-colors font-medium text-gray-200"
                            >
                               <ArrowUpTrayIcon className="w-5 h-5" />
                               <span>Tải lên tệp .txt</span>
                            </button>
                            
                            <div className="w-full text-left mt-4 mb-1">
                                <label htmlFor="script-input" className="text-sm font-medium text-gray-300">
                                    {uploadedFileName ? `Nội dung từ: ${uploadedFileName}` : 'Hoặc nhập trực tiếp:'}
                                </label>
                            </div>
                            <textarea
                                id="script-input"
                                value={uploadedScript}
                                onChange={(e) => setUploadedScript(e.target.value)}
                                placeholder="Dán hoặc nhập kịch bản của bạn vào đây..."
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 text-sm flex-grow focus:ring-2 focus:ring-[var(--theme-500)] focus:border-[var(--theme-500)] transition-colors"
                                rows={6}
                            />
                            
                            <div className="mt-4">
                               <ActionButton 
                                    onClick={handleUseUploadedScript} 
                                    Icon={ViewColumnsIcon} 
                                    text="Sử dụng Kịch bản này" 
                                    disabled={!uploadedScript.trim() || loadingStep === Step.IDEATION}
                                />
                            </div>
                        </div>
                    </div>
                    {loadingStep === Step.IDEATION && <LoadingSpinner />}
                </div>
              )}

              {step === Step.STORY_SELECTION && (
                <StorySelection 
                    stories={stories} 
                    onSelect={handleSelectStory} 
                    onLoadMore={handleLoadMoreStories}
                    isLoadingMore={isLoadingMore}
                />
              )}
              
              {(step === Step.STORY_EXPANSION || step === Step.STORY_EXPANDED) && (
                 <StoryDisplay story={selectedStory} isLoading={loadingStep === Step.STORY_EXPANSION} aiConfig={aiConfig} />
              )}

              {step === Step.STORY_EXPANDED && (
                <div className="text-center mt-8">
                  <ActionButton onClick={handleGenerateScript} Icon={ViewColumnsIcon} text="Tạo Kịch bản" />
                </div>
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
                 <PromptDisplay 
                    prompts={prompts} 
                    isLoading={loadingStep === Step.PROMPT_GENERATION} 
                    storyTitle={selectedStory?.title || null} 
                    aiConfig={aiConfig}
                    aspectRatio={aspectRatio}
                  />
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