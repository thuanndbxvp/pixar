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

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts, isLoading, storyTitle }) => {
    if (isLoading && prompts.length === 0) {
        return null;
    }

    const escapeCsvField = (field: string): string => {
        if (typeof field !== 'string') {
            return '';
        }
        // Replace any double quotes with two double quotes
        let result = field.replace(/"/g, '""');
        // If the field contains a comma, newline, or double quote, wrap it in double quotes
        if (result.search(/("|,|\n)/g) >= 0) {
            result = `"${result}"`;
        }
        return result;
    };

    const handleDownloadExcel = () => {
        if (prompts.length === 0) return;

        const headers = ['"Mô tả cảnh"', '"Prompt IMG"', '"Prompt Video"'];
        const csvRows = [headers.join(',')];

        prompts.forEach(p => {
            const row = [
                escapeCsvField(p.scene_text),
                escapeCsvField(p.image_prompt),
                escapeCsvField(p.video_prompt)
            ];
            csvRows.push(row.join(','));
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
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-[var(--theme-400)]">Gợi ý Hình ảnh</h2>
            {prompts.length > 0 && (
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                    title="Tải về file Excel (CSV)"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Tải về Excel</span>
                </button>
            )}
        </div>
      <div className="space-y-8">
        {prompts.map((p) => (
          <div key={p.scene_number} className="bg-gray-800/70 p-5 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-[var(--theme-400)] mb-4">Cảnh {p.scene_number}</h3>
            
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Mô tả cảnh</h4>
                    <p className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md">{p.scene_text}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Gợi ý Hình ảnh (9:16)</h4>
                    <div className="relative">
                        <p className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md pr-12">{p.image_prompt}</p>
                        <CopyButton textToCopy={p.image_prompt} />
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Gợi ý Video (9:16)</h4>
                    <div className="relative">
                        <p className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md pr-12">{p.video_prompt}</p>
                        <CopyButton textToCopy={p.video_prompt} />
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptDisplay;
