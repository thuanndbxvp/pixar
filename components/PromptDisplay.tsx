import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { ScenePrompt, AIConfig, ApiKeyStore } from '../types';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import { ClipboardDocumentIcon, CheckIcon, ArrowDownTrayIcon, LanguageIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import TranslationModal from './TranslationModal';
import LoadingSpinner from './LoadingSpinner';

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/50 hover:bg-gray-600/70 rounded-md text-gray-300 hover:text-white transition-all">
            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
        </button>
    );
};

const hasActiveApiKey = (provider: 'gemini' | 'openai'): boolean => {
    const storeStr = localStorage.getItem('apiKeyStore');
    if (!storeStr) return false;
    const store: ApiKeyStore = JSON.parse(storeStr);
    const providerStore = store[provider];
    if (!providerStore || !providerStore.activeKeyId) return false;
    const activeKey = providerStore.keys.find(k => k.id === providerStore.activeKeyId);
    return !!activeKey;
};

interface SceneCardProps {
  scene: ScenePrompt;
  aiConfig: AIConfig | null;
  aspectRatio: '9:16' | '16:9';
  onImageGenerated: () => void;
  isBatchGenerating: boolean;
}

export interface SceneCardHandle {
  generate: () => Promise<void>;
  getImageData: () => { sceneNumber: number; data: string } | null;
  hasImage: () => boolean;
  setStatus: (status: 'idle' | 'queued' | 'generating' | 'success' | 'error') => void;
}


const SceneCard = forwardRef<SceneCardHandle, SceneCardProps>(({ scene, aiConfig, aspectRatio, onImageGenerated, isBatchGenerating }, ref) => {
    const [status, setStatus] = useState<'idle' | 'queued' | 'generating' | 'success' | 'error'>('idle');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canGenerate = aiConfig ? hasActiveApiKey(aiConfig.provider) : false;

    const handleGenerateImage = useCallback(async () => {
        if (!aiConfig || !canGenerate) {
            const errText = "Vui lòng kích hoạt API key cho nhà cung cấp đã chọn để tạo ảnh.";
            setError(errText);
            setStatus('error');
            throw new Error(errText);
        }
        
        setStatus('generating');
        setError(null);
        
        try {
            let imageB64: string;
            if (aiConfig.provider === 'gemini') {
                imageB64 = await geminiService.generateImageFromPrompt(scene.image_prompt);
            } else {
                imageB64 = await openaiService.generateImageFromPrompt(scene.image_prompt, aspectRatio);
            }
            setGeneratedImage(`data:image/png;base64,${imageB64}`);
            setStatus('success');
            onImageGenerated();
        } catch (err: any) {
            setError(err.message || 'Một lỗi không xác định đã xảy ra khi tạo ảnh.');
            setStatus('error');
            throw err;
        }
    }, [aiConfig, canGenerate, scene.image_prompt, aspectRatio, onImageGenerated]);

     useImperativeHandle(ref, () => ({
        generate: async () => {
            if (status !== 'success' && status !== 'generating') {
                await handleGenerateImage();
            }
        },
        getImageData: () => {
            if (generatedImage) {
                return {
                    sceneNumber: scene.scene_number,
                    data: generatedImage.split(',')[1] 
                };
            }
            return null;
        },
        hasImage: () => !!generatedImage,
        setStatus: (newStatus) => setStatus(newStatus),
    }), [generatedImage, handleGenerateImage, status, scene.scene_number]);


    return (
        <div className="bg-gray-800/70 p-5 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-[var(--theme-400)] mb-4">Cảnh {scene.scene_number}</h3>
            <div className="grid md:grid-cols-10 gap-6">
                <div className="md:col-span-7 space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Mô tả cảnh</h4>
                        <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md">
                            <p className="whitespace-pre-wrap">{scene.scene_text}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Gợi ý Hình ảnh</h4>
                        <div className="relative">
                            <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md pr-12">
                                <p className="whitespace-pre-wrap">{scene.image_prompt}</p>
                            </div>
                            <CopyButton textToCopy={scene.image_prompt} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Gợi ý Video</h4>
                        <div className="relative">
                            <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md pr-12">
                                <p className="whitespace-pre-wrap">{scene.video_prompt}</p>
                            </div>
                            <CopyButton textToCopy={scene.video_prompt} />
                        </div>
                    </div>
                </div>
                <div className="md:col-span-3 flex flex-col items-center justify-center bg-gray-900/50 p-4 rounded-lg min-h-[250px]">
                    <div className="w-full flex-grow flex items-center justify-center">
                        {status === 'generating' ? (
                            <div className="flex flex-col items-center text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-400)]"></div>
                                <p className="mt-2 text-sm text-gray-400">Đang tạo ảnh...</p>
                            </div>
                        ) : status === 'error' ? (
                             <div className="text-center text-sm text-red-400 bg-red-500/10 p-3 rounded-md">
                                <p className="font-semibold">Lỗi!</p>
                                <p>{error}</p>
                            </div>
                        ) : status === 'success' && generatedImage ? (
                            <img src={generatedImage} alt={`Generated image for scene ${scene.scene_number}`} className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-gray-500">
                                { status === 'queued' ? (
                                    <>
                                        <p className="text-sm font-semibold text-blue-400">Đang chờ trong hàng...</p>
                                    </>
                                ) : (
                                    <>
                                        <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                                        <p className="text-sm">Xem trước hình ảnh sẽ xuất hiện ở đây.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleGenerateImage}
                        disabled={status === 'generating' || !canGenerate || isBatchGenerating}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--theme-500)] hover:bg-[var(--theme-600)] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>{status === 'success' ? 'Tạo lại ảnh' : 'Tạo ảnh'}</span>
                    </button>
                    {!canGenerate && <p className="text-xs text-yellow-400 mt-2 text-center">Vui lòng kích hoạt API key để tạo ảnh.</p>}
                </div>
            </div>
        </div>
    );
});


interface PromptDisplayProps {
  prompts: ScenePrompt[];
  isLoading: boolean;
  storyTitle: string | null;
  aiConfig: AIConfig | null;
  aspectRatio: '9:16' | '16:9';
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts, isLoading, storyTitle, aiConfig, aspectRatio }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [translation, setTranslation] = useState<string | null>(null);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);

    const [isBatchGenerating, setIsBatchGenerating] = useState(false);
    const [generatedImageCount, setGeneratedImageCount] = useState(0);
    const sceneCardRefs = useRef<(SceneCardHandle | null)[]>([]);

    useEffect(() => {
        sceneCardRefs.current = sceneCardRefs.current.slice(0, prompts.length);
    }, [prompts]);

    useEffect(() => {
        setTranslation(null);
        setTranslationError(null);
        setIsTranslating(false);
        setGeneratedImageCount(0);
    }, [prompts]);
    
    const handleImageGenerated = useCallback(() => {
        setGeneratedImageCount(prev => prev + 1);
    }, []);

    const handleGenerateAllImages = async () => {
        setIsBatchGenerating(true);
    
        const queue = sceneCardRefs.current
            .map((ref, index) => (ref && !ref.hasImage() ? index : -1))
            .filter(index => index !== -1);
    
        if (queue.length === 0) {
            setIsBatchGenerating(false);
            return;
        }
    
        queue.forEach(index => sceneCardRefs.current[index]?.setStatus('queued'));
    
        const worker = async () => {
            while (queue.length > 0) {
                const index = queue.shift();
                if (index !== undefined) {
                    const ref = sceneCardRefs.current[index];
                    if (ref) {
                        try {
                            await ref.generate();
                        } catch (e) {
                            console.error(`Lỗi trong worker cho cảnh ${index + 1}:`, e);
                        }
                    }
                }
            }
        };
    
        const CONCURRENCY = 4;
        const workerPromises = Array.from({ length: CONCURRENCY }, worker);
    
        await Promise.all(workerPromises);
    
        setIsBatchGenerating(false);
    };

    const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    };
    
    const handleDownloadAllImages = () => {
        const cleanTitle = (storyTitle || 'animation')
            .split('(')[0].trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();

        sceneCardRefs.current.forEach(ref => {
            const imageData = ref?.getImageData();
            if (imageData) {
                const blob = b64toBlob(imageData.data, 'image/png');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${cleanTitle}_scene_${imageData.sceneNumber}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });
    };

    const handleDownloadPrompts = () => {
        if (prompts.length === 0) return;

        const content = prompts.map(p => 
            `--- Cảnh ${p.scene_number} ---\n\n` +
            `Mô tả cảnh:\n${p.scene_text}\n\n` +
            `Gợi ý Hình ảnh:\n${p.image_prompt}\n\n` +
            `Gợi ý Video:\n${p.video_prompt}`
        ).join('\n\n\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const cleanTitle = (storyTitle || 'animation_prompts')
            .split('(')[0].trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();

        link.download = `${cleanTitle}_prompts.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const formatPromptsForTranslation = (): string => {
      return prompts.map(p => 
        `--- Cảnh ${p.scene_number} ---\n\nMô tả cảnh:\n${p.scene_text}\n\nGợi ý Hình ảnh:\n${p.image_prompt}\n\nGợi ý Video:\n${p.video_prompt}`
      ).join('\n\n');
    };

    const handleTranslate = async () => {
        if (prompts.length === 0 || !aiConfig) return;
        setIsTranslationModalOpen(true);

        if (!translation && !isTranslating) {
            setIsTranslating(true);
            setTranslation(null);
            setTranslationError(null);
            try {
                const textToTranslate = formatPromptsForTranslation();
                const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
                const result = await service.translateText(textToTranslate, aiConfig.model);
                setTranslation(result);
            } catch (err: any) {
                setTranslationError(`Không thể dịch các gợi ý: ${err.message}`);
            } finally {
                setIsTranslating(false);
            }
        }
    };

  return (
    <>
    <TranslationModal
        isOpen={isTranslationModalOpen}
        onClose={() => setIsTranslationModalOpen(false)}
        title="Bản dịch Gợi ý"
        isLoading={isTranslating}
        translation={translation}
        error={translationError}
    />
    <div>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-2xl font-semibold text-[var(--theme-400)]">Gợi ý Hình ảnh{storyTitle ? `: ${storyTitle.split('(')[0].trim()}` : ''}</h2>
            {prompts.length > 0 && !isLoading && (
                <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateAllImages}
                      disabled={isBatchGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-wait"
                      title="Tạo tất cả ảnh"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      <span>Tạo tất cả ảnh</span>
                    </button>
                    <button
                      onClick={handleDownloadAllImages}
                      disabled={generatedImageCount === 0 || isBatchGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Tải về tất cả ảnh đã tạo"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Tải ảnh về ({generatedImageCount})</span>
                    </button>
                    <button
                          onClick={handleTranslate}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Dịch sang tiếng Việt"
                      >
                         <LanguageIcon className="w-4 h-4" />
                         <span>Dịch</span>
                      </button>
                     <button
                          onClick={handleDownloadPrompts}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Tải về tất cả gợi ý (.txt)"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                          <span>Tải về</span>
                        </button>
                </div>
            )}
        </div>
        {isLoading ? (
            <LoadingSpinner />
        ) : (
            <div className="space-y-8">
            {prompts.map((p, index) => (
              <SceneCard
                key={p.scene_number}
                ref={el => sceneCardRefs.current[index] = el}
                scene={p}
                aiConfig={aiConfig}
                aspectRatio={aspectRatio}
                onImageGenerated={handleImageGenerated}
                isBatchGenerating={isBatchGenerating}
              />
            ))}
            </div>
        )}
    </div>
    </>
  );
};

export default PromptDisplay;