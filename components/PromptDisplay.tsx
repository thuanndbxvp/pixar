import React, { useState } from 'react';
import type { ScenePrompt } from '../types';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface PromptDisplayProps {
  prompts: ScenePrompt[];
  isLoading: boolean;
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

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts, isLoading }) => {
    if (isLoading && prompts.length === 0) {
        return null;
    }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center text-[var(--theme-400)]">Gợi ý Hình ảnh</h2>
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