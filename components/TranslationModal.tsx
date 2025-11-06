import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from './LoadingSpinner';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading: boolean;
  translation: string | null;
  error: string | null;
}

const TranslationModal: React.FC<TranslationModalProps> = ({
  isOpen,
  onClose,
  title,
  isLoading,
  translation,
  error,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error('Không thể sao chép bản dịch: ', err);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#1A233A] text-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col" style={{height: 'min(80vh, 700px)'}}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          {isLoading && <LoadingSpinner />}
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg ring-1 ring-red-500/30">{error}</div>}
          {translation && (
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-300">
              {translation}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-900/50 rounded-b-2xl flex justify-between items-center flex-shrink-0 border-t border-gray-700">
          <button
            onClick={handleCopy}
            disabled={!translation || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
            <span>{isCopied ? 'Đã sao chép' : 'Sao chép Bản dịch'}</span>
          </button>
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;