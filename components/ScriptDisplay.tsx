import React, { useState } from 'react';
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ScriptDisplayProps {
    script: string;
    isLoading: boolean;
}

interface FormattedScriptProps {
  text: string;
  showAnnotations: boolean;
}

const renderLine = (line: string, showAnnotations: boolean, key: string | number) => {
    // Regex to find annotation like "(...)" at the very end of a line.
    const annotationRegex = /\s*\(([^)]+)\)$/;
    const match = line.match(annotationRegex);

    const mainText = match ? line.replace(annotationRegex, '').trim() : line;
    const annotationText = match ? `(${match[1]})` : null;

    const annotationSpan = showAnnotations && annotationText ? (
        <span className="text-[var(--theme-400)]/90 ml-2 italic">{annotationText}</span>
    ) : null;

    // Special styling for major headings
    if (mainText.toUpperCase().startsWith('CHARACTERS')) {
        return <h2 key={key} className="text-2xl font-bold text-[var(--theme-400)] mt-4 mb-2">{mainText}{annotationSpan}</h2>;
    }
    if (mainText.toUpperCase().startsWith('SCENE')) {
        return <h3 key={key} className="text-xl font-semibold text-[var(--theme-400)] mt-4 mb-2">{mainText}{annotationSpan}</h3>;
    }

    // Special styling for labeled lines like "Setting:", "Action:"
    const labelRegex = /^\s*(Setting|Characters|Action|Emotion\/Lesson):/;
    const labelMatch = mainText.match(labelRegex);
    if (labelMatch) {
        const label = labelMatch[0];
        const content = mainText.substring(label.length);
        return (
            <p key={key} className="text-gray-300">
                <span className="font-semibold text-gray-200">{label}</span>
                {content}
                {annotationSpan}
            </p>
        );
    }
    
    // Default paragraph rendering
    if (!mainText.trim()) return null; // Don't render empty lines
    return (
        <p key={key} className="text-gray-300">
            {mainText}
            {annotationSpan}
        </p>
    );
};

const FormattedScript: React.FC<FormattedScriptProps> = ({ text, showAnnotations }) => {
  const parts = text.split(/(\n---\n)/g); // Split by separator but keep it
  
  return (
    <div className="space-y-6">
      {parts.map((part, index) => {
        if (part.trim() === '---') {
          return <hr key={index} className="border-gray-600" />;
        }
        
        return (
          <div key={index}>
            {part.split('\n').map((line, lineIndex) => renderLine(line, showAnnotations, `${index}-${lineIndex}`))}
          </div>
        );
      })}
    </div>
  );
};


const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, isLoading }) => {
    const [showAnnotations, setShowAnnotations] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    if (isLoading && !script) {
        return null; // Don't show anything until loading is done or script is available
    }
    
    const handleDownload = () => {
        if (!script) return;
        const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'kich-ban-phim-hoat-hinh.txt';
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

    return (
        <div className="prose prose-invert prose-p:text-gray-300 max-w-none bg-gray-900/50 p-6 rounded-lg ring-1 ring-gray-700">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-2xl font-semibold text-[var(--theme-400)] m-0">Kịch bản được tạo</h2>
              {script && (
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
                          onClick={handleDownload}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Tải kịch bản dưới dạng tệp .txt"
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
            {script ? <FormattedScript text={script} showAnnotations={showAnnotations} /> : <p>Đang tạo kịch bản của bạn...</p>}
        </div>
    );
};

export default ScriptDisplay;