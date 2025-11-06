import React, { useState } from 'react';
import type { ScenePrompt } from '../types';
import { ClipboardDocumentIcon, CheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface PromptDisplayProps {
  prompts: ScenePrompt[];
  isLoading: boolean;
  storyTitle: string | null;
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

// This parser separates the main English text from the Vietnamese annotations in parentheses.
const parseAnnotatedText = (text: string): { main: string; annotation: string } => {
    if (!text) return { main: '', annotation: '' };

    const annotationRegex = /\s*\(([^)]+)\)([:.]*)$/;
    const mainLines: string[] = [];
    const annotationLines: string[] = [];

    text.split('\n').forEach(line => {
        const match = line.match(annotationRegex);
        if (match) {
            // Main part of the line (text before the annotation)
            const mainPart = (line.substring(0, match.index) + (match[2] || '')).trimEnd();
            if (mainPart) {
                mainLines.push(mainPart);
            }
            // The annotation part
            annotationLines.push(match[1]);
        } else {
            mainLines.push(line);
        }
    });

    return {
        main: mainLines.join('\n'),
        annotation: annotationLines.join('\n'),
    };
};


const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts, isLoading, storyTitle }) => {
    const [showAnnotations, setShowAnnotations] = useState(false);

    if (isLoading && prompts.length === 0) {
        return null;
    }

    const handleDownloadExcel = () => {
        if (prompts.length === 0) return;

        // Using semicolon as a delimiter for better Excel compatibility in many regions (especially non-US).
        const DELIMITER = ';';

        const escapeCsvField = (field: string): string => {
            if (typeof field !== 'string') {
                return '';
            }
            let result = field.replace(/"/g, '""'); // Escape double quotes
            // If the field contains the delimiter, a newline, or a double quote, it must be enclosed in double quotes.
            if (result.includes(DELIMITER) || result.includes('\n') || result.includes('"')) {
                result = `"${result}"`;
            }
            return result;
        };

        const headers = ['Mô tả cảnh', 'Chú thích Tiếng Việt', 'Prompt IMG', 'Chú thích prompt IMG', 'Prompt Video', 'Chú thích prompt video'];
        const csvRows = [headers.join(DELIMITER)];

        prompts.forEach(p => {
            const { main: sceneMainText, annotation: sceneAnnotation } = parseAnnotatedText(p.scene_text);
            const { main: imagePromptMain, annotation: imagePromptAnnotation } = parseAnnotatedText(p.image_prompt);
            const { main: videoPromptMain, annotation: videoPromptAnnotation } = parseAnnotatedText(p.video_prompt);

            const row = [
                escapeCsvField(sceneMainText),
                escapeCsvField(sceneAnnotation || ''),
                escapeCsvField(imagePromptMain),
                escapeCsvField(imagePromptAnnotation || ''),
                escapeCsvField(videoPromptMain),
                escapeCsvField(videoPromptAnnotation || '')
            ];
            csvRows.push(row.join(DELIMITER));
        });

        // Add BOM for proper UTF-8 handling in Excel
        const csvString = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const cleanTitle = storyTitle ? storyTitle.split('(')[0].trim() : 'prompts';
        const filenameBase = cleanTitle
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();

        link.setAttribute('download', `pixar_prompts_${filenameBase}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

  return (
    <div>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-2xl font-semibold text-[var(--theme-400)]">Gợi ý Hình ảnh</h2>
            {prompts.length > 0 && (
                <div className="flex items-center gap-2">
                     <button
                        onClick={() => setShowAnnotations(!showAnnotations)}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${
                        showAnnotations 
                            ? 'bg-[var(--theme-500)] text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                    >
                        Chú thích tiếng Việt
                    </button>
                    <button
                        onClick={handleDownloadExcel}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                        title="Tải về file Excel (CSV)"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Tải về Excel</span>
                    </button>
                </div>
            )}
        </div>
      <div className="space-y-8">
        {prompts.map((p) => {
          const { main: sceneMainText, annotation: sceneAnnotation } = parseAnnotatedText(p.scene_text);
          const { main: imagePromptMain, annotation: imagePromptAnnotation } = parseAnnotatedText(p.image_prompt);
          const { main: videoPromptMain, annotation: videoPromptAnnotation } = parseAnnotatedText(p.video_prompt);
          
          return (
              <div key={p.scene_number} className="bg-gray-800/70 p-5 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-[var(--theme-400)] mb-4">Cảnh {p.scene_number}</h3>
                
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Mô tả cảnh</h4>
                        <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md">
                            <p className="whitespace-pre-wrap">{sceneMainText}</p>
                            {showAnnotations && sceneAnnotation && (
                                <div className="mt-2 pt-2 border-t border-gray-700/50">
                                    <p className="italic text-[var(--theme-400)] opacity-95 whitespace-pre-wrap">{sceneAnnotation}</p>
                                </div>
                            )}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Gợi ý Hình ảnh (9:16)</h4>
                        <div className="relative">
                            <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md pr-12">
                               <p className="whitespace-pre-wrap">{imagePromptMain}</p>
                                {showAnnotations && imagePromptAnnotation && (
                                    <div className="mt-2 pt-2 border-t border-gray-700/50">
                                        <p className="italic text-[var(--theme-400)] opacity-95 whitespace-pre-wrap">{imagePromptAnnotation}</p>
                                    </div>
                                )}
                            </div>
                            <CopyButton textToCopy={imagePromptMain} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Gợi ý Video (9:16)</h4>
                        <div className="relative">
                             <div className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md pr-12">
                               <p className="whitespace-pre-wrap">{videoPromptMain}</p>
                                {showAnnotations && videoPromptAnnotation && (
                                    <div className="mt-2 pt-2 border-t border-gray-700/50">
                                        <p className="italic text-[var(--theme-400)] opacity-95 whitespace-pre-wrap">{videoPromptAnnotation}</p>
                                    </div>
                                )}
                            </div>
                            <CopyButton textToCopy={videoPromptMain} />
                        </div>
                    </div>
                </div>
              </div>
          );
        })}
      </div>
    </div>
  );
};

export default PromptDisplay;