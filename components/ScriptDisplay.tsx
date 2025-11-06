import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CheckIcon, LanguageIcon } from '@heroicons/react/24/outline';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import type { AIConfig } from '../types';
import TranslationModal from './TranslationModal';
import LoadingSpinner from './LoadingSpinner';

interface ScriptDisplayProps {
    script: string;
    isLoading: boolean;
    storyTitle: string | null;
    aiConfig: AIConfig | null;
}

const renderLine = (line: string, key: string | number) => {
    let mainElement = null;

    if (line.trim()) {
        if (line.toUpperCase().startsWith('CHARACTERS')) {
            mainElement = <h2 className="text-2xl font-bold text-[var(--theme-400)] mt-6">{line}</h2>;
        } else if (line.toUpperCase().startsWith('SCENE')) {
            mainElement = <h3 className="text-xl font-semibold text-[var(--theme-400)] mt-6">{line}</h3>;
        } else {
            const labelRegex = /^\s*(Setting|Characters|Action|Emotion\/Lesson|Species|Detailed Appearance|Visual Style Keywords):/;
            const labelMatch = line.match(labelRegex);
            if (labelMatch) {
                const label = labelMatch[0];
                const content = line.substring(label.length);
                mainElement = (
                    <p className="text-gray-300 leading-relaxed">
                        <span className="font-semibold text-gray-200">{label}</span>
                        {content}
                    </p>
                );
            } else {
                mainElement = (
                    <p className="text-gray-300 leading-relaxed">
                        {line}
                    </p>
                );
            }
        }
    }
    
    return (
        <div key={key} className="mb-2">
            {mainElement}
        </div>
    );
};

const FormattedScript: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\n---\n)/g);
  
  return (
    <div className="space-y-6">
      {parts.map((part, index) => {
        if (part.trim() === '---') {
          return <hr key={index} className="border-gray-600" />;
        }
        
        return (
          <div key={index}>
            {part.split('\n').map((line, lineIndex) => renderLine(line, `${index}-${lineIndex}`))}
          </div>
        );
      })}
    </div>
  );
};

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, isLoading, storyTitle, aiConfig }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translation, setTranslation] = useState<string | null>(null);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);

    useEffect(() => {
        // Reset translation state if the script content changes.
        // This ensures a new translation is fetched for a new script.
        setTranslation(null);
        setTranslationError(null);
        setIsTranslating(false);
    }, [script]);

    const handleDownload = () => {
        if (!script) return;
        
        const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const cleanTitle = storyTitle ? storyTitle.split('(')[0].trim() : 'untitled_script';
        const filenameBase = cleanTitle
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();

        link.download = `script_pixar_${filenameBase}.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleCopy = () => {
        if (!script) return;
        navigator.clipboard.writeText(script).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(err => {
            console.error('Không thể sao chép văn bản: ', err);
            alert('Không thể sao chép văn bản. Vui lòng thử lại.');
        });
    };
    
    const handleTranslate = async () => {
        if (!script || !aiConfig) return;
        
        setIsTranslationModalOpen(true);

        // Only fetch translation if it doesn't exist and we're not already fetching it.
        if (!translation && !isTranslating) { 
            setIsTranslating(true);
            setTranslationError(null);
            try {
                const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
                const result = await service.translateText(script, aiConfig.model);
                setTranslation(result);
            } catch (err: any) {
                setTranslationError(`Không thể dịch kịch bản: ${err.message}`);
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
            title="Bản dịch kịch bản"
            isLoading={isTranslating}
            translation={translation}
            error={translationError}
        />
        <div className="prose prose-invert prose-p:text-gray-300 max-w-none bg-gray-900/50 p-6 rounded-lg ring-1 ring-gray-700">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-2xl font-semibold text-[var(--theme-400)] m-0">Kịch bản được tạo{storyTitle ? `: ${storyTitle.split('(')[0].trim()}` : ''}</h2>
              {script && !isLoading && (
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
                          title="Tải kịch bản (.txt)"
                      >
                         <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>

                       <button
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Sao chép toàn bộ kịch bản"
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
            ) : script ? (
                <FormattedScript text={script} />
            ) : (
                <p className="text-gray-400">Kịch bản sẽ xuất hiện ở đây sau khi được tạo.</p>
            )}
        </div>
        </>
    );
};

export default ScriptDisplay;