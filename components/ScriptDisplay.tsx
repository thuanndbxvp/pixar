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
    const annotationText = match ? match[1] : null;

    const annotationElement = showAnnotations && annotationText ? (
        <div className="mt-1.5 ml-4 bg-gray-800/70 p-3 rounded-lg border border-gray-700">
            <p className="text-sm italic text-[var(--theme-400)] opacity-95 leading-relaxed">{annotationText}</p>
        </div>
    ) : null;

    // Don't render anything for lines that are completely empty
    if (!mainText.trim()) {
        return null;
    }
    
    let mainElement = null;

    if (mainText.toUpperCase().startsWith('CHARACTERS')) {
        mainElement = <h2 className="text-2xl font-bold text-[var(--theme-400)] mt-6">{mainText}</h2>;
    } else if (mainText.toUpperCase().startsWith('SCENE')) {
        mainElement = <h3 className="text-xl font-semibold text-[var(--theme-400)] mt-6">{mainText}</h3>;
    } else {
        const labelRegex = /^\s*(Setting|Characters|Action|Emotion\/Lesson):/;
        const labelMatch = mainText.match(labelRegex);
        if (labelMatch) {
            const label = labelMatch[0];
            const content = mainText.substring(label.length);
            mainElement = (
                <p className="text-gray-300 leading-relaxed">
                    <span className="font-semibold text-gray-200">{label}</span>
                    {content}
                </p>
            );
        } else {
             mainElement = (
                <p className="text-gray-300 leading-relaxed">
                    {mainText}
                </p>
            );
        }
    }
    
    return (
        <div key={key} className="mb-2">
            {mainElement}
            {annotationElement}
        </div>
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