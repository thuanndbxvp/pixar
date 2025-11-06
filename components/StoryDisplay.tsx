import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CheckIcon, LanguageIcon } from '@heroicons/react/24/outline';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import type { Story, AIConfig } from '../types';
import TranslationModal from './TranslationModal';
import LoadingSpinner from './LoadingSpinner';

interface StoryDisplayProps {
    story: Story | null;
    isLoading: boolean;
    aiConfig: AIConfig | null;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading, aiConfig }) => {
    const expandedStory = story?.expandedStory || '';
    const storyTitle = story?.title || null;
    const [isCopied, setIsCopied] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translation, setTranslation] = useState<string | null>(null);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);

    useEffect(() => {
        setTranslation(null);
        setTranslationError(null);
        setIsTranslating(false);
    }, [expandedStory]);

    const handleDownload = () => {
        if (!expandedStory) return;
        
        const blob = new Blob([expandedStory], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const cleanTitle = storyTitle ? storyTitle.split('(')[0].trim() : 'untitled_story';
        const filenameBase = cleanTitle
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();

        link.download = `story_pixar_${filenameBase}.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleCopy = () => {
        if (!expandedStory) return;
        navigator.clipboard.writeText(expandedStory).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(err => {
            console.error('Không thể sao chép văn bản: ', err);
            alert('Không thể sao chép văn bản. Vui lòng thử lại.');
        });
    };
    
    const handleTranslate = async () => {
        if (!expandedStory || !aiConfig) return;
        
        setIsTranslationModalOpen(true);

        if (!translation && !isTranslating) { 
            setIsTranslating(true);
            setTranslationError(null);
            try {
                const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
                const result = await service.translateText(expandedStory, aiConfig.model);
                setTranslation(result);
            } catch (err: any) {
                setTranslationError(`Không thể dịch câu chuyện: ${err.message}`);
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
            title="Bản dịch câu chuyện"
            isLoading={isTranslating}
            translation={translation}
            error={translationError}
        />
        <div className="prose prose-invert max-w-none bg-gray-900/50 p-6 rounded-lg ring-1 ring-gray-700">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-2xl font-semibold text-[var(--theme-400)] m-0">Câu chuyện Hoàn chỉnh{storyTitle ? `: ${storyTitle.split('(')[0].trim()}` : ''}</h2>
              {expandedStory && !isLoading && (
                  <div className="flex items-center gap-2">
                       <button
                          onClick={handleTranslate}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Dịch sang tiếng Việt"
                      >
                         <LanguageIcon className="w-4 h-4" />
                          <span>Dịch</span>
                      </button>

                       <button
                          onClick={handleDownload}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Tải câu chuyện (.txt)"
                      >
                         <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>

                       <button
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Sao chép toàn bộ câu chuyện"
                      >
                          {isCopied ? (
                              <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                              <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                      </button>
                  </div>
              )}
            </div>
            {isLoading ? (
                <LoadingSpinner />
            ) : expandedStory ? (
                 <div className="whitespace-pre-wrap text-gray-300 leading-relaxed bg-gray-900/50 p-4 rounded-md ring-1 ring-gray-800">
                    {expandedStory}
                </div>
            ) : (
                <p className="text-gray-400">Câu chuyện hoàn chỉnh sẽ xuất hiện ở đây sau khi được tạo.</p>
            )}
        </div>
        </>
    );
};

export default StoryDisplay;