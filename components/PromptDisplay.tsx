import React, { useState, useRef, useEffect } from 'react';
import type { ScenePrompt, AIConfig } from '../types';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import { ClipboardDocumentIcon, CheckIcon, ArrowDownTrayIcon, LanguageIcon } from '@heroicons/react/24/outline';
import TranslationModal from './TranslationModal';
import LoadingSpinner from './LoadingSpinner';

interface PromptDisplayProps {
  prompts: ScenePrompt[];
  isLoading: boolean;
  storyTitle: string | null;
  aiConfig: AIConfig | null;
}

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

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts, isLoading, storyTitle, aiConfig }) => {
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translation, setTranslation] = useState<string | null>(null);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setIsDownloadMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Reset translation state if the prompts content changes.
        setTranslation(null);
        setTranslationError(null);
        setIsTranslating(false);
    }, [prompts]);

    const handleDownloadCsv = (type: 'all' | 'image' | 'video') => {
        if (prompts.length === 0) return;

        const escapeCsvCell = (cell: string | number): string => {
            const str = String(cell).trim();
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        let csvContent: string;

        switch (type) {
            case 'all': {
                const headers = ['Scene Number', 'Scene Description', 'Image Prompt', 'Video Prompt'];
                const dataRows = prompts.map(p => [p.scene_number, p.scene_text, p.image_prompt, p.video_prompt]);
                const csvRows = [
                    headers.join(','),
                    ...dataRows.map(row => row.map(escapeCsvCell).join(','))
                ];
                csvContent = csvRows.join('\n');
                break;
            }
            case 'image': {
                const dataRows = prompts.map(p => [p.image_prompt]);
                csvContent = dataRows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
                break;
            }
            case 'video': {
                const dataRows = prompts.map(p => [p.video_prompt]);
                csvContent = dataRows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
                break;
            }
        }
        
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const cleanTitle = storyTitle ? storyTitle.split('(')[0].trim() : 'prompts';
        const filenameBase = cleanTitle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();

        const fileTypeMap = {
            all: 'all_prompts',
            image: 'image_prompts',
            video: 'video_prompts'
        };

        link.download = `pixar_${fileTypeMap[type]}_${filenameBase}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloadMenuOpen(false);
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
            <h2 className="text-2xl font-semibold text-[var(--theme-400)]">Gợi ý Hình ảnh</h2>
            {prompts.length > 0 && !isLoading && (
                <div className="flex items-center gap-2">
                    <button
                          onClick={handleTranslate}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Dịch sang tiếng Việt"
                      >
                         <LanguageIcon className="w-4 h-4" />
                         <span>Dịch</span>
                      </button>
                    <div className="relative" ref={downloadMenuRef}>
                        <button
                          onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Tải về"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                          <span>Tải về</span>
                        </button>
                        {isDownloadMenuOpen && (
                          <div className="absolute top-full right-0 mt-2 w-max bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 p-1">
                            <ul>
                              <li>
                                <button
                                  onClick={() => handleDownloadCsv('all')}
                                  className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-700 text-gray-300 transition-colors"
                                >
                                  Tải Excel (Đầy đủ)
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => handleDownloadCsv('image')}
                                  className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-700 text-gray-300 transition-colors"
                                >
                                  Tải Excel (Chỉ Ảnh)
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => handleDownloadCsv('video')}
                                  className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-700 text-gray-300 transition-colors"
                                >
                                  Tải Excel (Chỉ Video)
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                </div>
            )}
        </div>
        {isLoading ? (
            <LoadingSpinner />
        ) : (
            <div className="space-y-8">
            {prompts.map((p) => (
                  <div key={p.scene_number} className="bg-gray-800/70 p-5 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-[var(--theme-400)] mb-4">Cảnh {p.scene_number}</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Mô tả cảnh</h4>
                            <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md">
                                <p className="whitespace-pre-wrap">{p.scene_text}</p>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Gợi ý Hình ảnh</h4>
                            <div className="relative">
                                <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md pr-12">
                                   <p className="whitespace-pre-wrap">{p.image_prompt}</p>
                                </div>
                                <CopyButton textToCopy={p.image_prompt} />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Gợi ý Video</h4>
                            <div className="relative">
                                 <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md pr-12">
                                   <p className="whitespace-pre-wrap">{p.video_prompt}</p>
                                </div>
                                <CopyButton textToCopy={p.video_prompt} />
                            </div>
                        </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
    </div>
    </>
  );
};

export default PromptDisplay;