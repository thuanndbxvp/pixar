import React, { useState, useCallback } from 'react';
import { generateStoryIdeas, expandStoryAndCreateCast, generateVisualPrompts } from './services/geminiService';
import type { Story, AppStep, ScenePrompt } from './types';
import { Step } from './types';
import StorySelection from './components/StorySelection';
import ScriptDisplay from './components/ScriptDisplay';
import PromptDisplay from './components/PromptDisplay';
import StepIndicator from './components/StepIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import ActionButton from './components/ActionButton';
import { FilmIcon, SparklesIcon, Bars3BottomLeftIcon, PhotoIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(Step.IDEATION);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [script, setScript] = useState<string>('');
  const [prompts, setPrompts] = useState<ScenePrompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userIdea, setUserIdea] = useState<string>('');

  const handleGenerateStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedStories = await generateStoryIdeas();
      setStories(generatedStories);
      setStep(Step.STORY_SELECTION);
    } catch (err) {
      setError('Không thể tạo ý tưởng câu chuyện. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDevelopUserIdea = useCallback(async () => {
    if (!userIdea.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setStep(Step.SCRIPT_GENERATION);
    try {
      const expandedScript = await expandStoryAndCreateCast(userIdea);
      setScript(expandedScript);
      setSelectedStory({ id: 0, title: "Ý tưởng của người dùng", content: userIdea }); // Create a dummy story object for context
      setStep(Step.SCRIPT_GENERATED);
    } catch (err) {
      setError('Không thể phát triển ý tưởng của bạn. Vui lòng thử lại.');
      console.error(err);
      setStep(Step.IDEATION); // Go back to ideation on error
    } finally {
      setIsLoading(false);
    }
  }, [userIdea]);

  const handleSelectStory = useCallback(async (story: Story) => {
    setSelectedStory(story);
    setIsLoading(true);
    setError(null);
    setStep(Step.SCRIPT_GENERATION);
    try {
      const expandedScript = await expandStoryAndCreateCast(story.content);
      setScript(expandedScript);
      setStep(Step.SCRIPT_GENERATED);
    } catch (err) {
      setError('Không thể phát triển câu chuyện. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGeneratePrompts = useCallback(async () => {
    if (!script) return;
    setIsLoading(true);
    setError(null);
    setStep(Step.PROMPT_GENERATION);
    try {
      const visualPrompts = await generateVisualPrompts(script);
      setPrompts(visualPrompts);
      setStep(Step.PROMPTS_GENERATED);
    } catch (err) {
      setError('Không thể tạo gợi ý hình ảnh. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [script]);
  
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <FilmIcon className="h-10 w-10 text-cyan-400"/>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
              Trợ lý Sáng tạo Phim hoạt hình
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-400">Đối tác AI của bạn để tạo phim hoạt hình ngắn theo phong cách Pixar.</p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/30 p-6 ring-1 ring-white/10">
          <StepIndicator currentStep={step} />

          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg my-4 ring-1 ring-red-500/30">{error}</div>}

          {isLoading && <LoadingSpinner />}

          {!isLoading && (
            <>
              {step === Step.IDEATION && (
                <div className="text-center">
                    <p className="text-gray-300 mb-4">Bạn có một ý tưởng sơ khai? Hãy nhập vào bên dưới để AI phát triển nó thành kịch bản.</p>
                    <textarea
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors mb-4"
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