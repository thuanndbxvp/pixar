import React, { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ScriptDisplayProps {
    script: string;
    isLoading: boolean;
    storyTitle: string | null;
}

interface FormattedScriptProps {
  text: string;
  showAnnotations: boolean;
}

const renderLine = (line: string, showAnnotations: boolean, key: string | number) => {
    // Regex to find annotation like "(...)" at the end of a line, allowing for trailing punctuation.
    const annotationRegex = /\s*\(([^)]+)\)([:.]*)$/;
    const match = line.match(annotationRegex);

    let mainText: string;
    let annotationText: string | null;

    if (match) {
        mainText = (line.substring(0, match.index) + (match[2] || '')).trim();
        annotationText = match[1];
    } else {
        mainText = line;
        annotationText = null;
    }

    const annotationElement = showAnnotations && annotationText ? (
        <div className="mt-1.5 ml-4 bg-gray-800/70 p-3 rounded-lg border border-gray-700">
            <p className="text-sm italic text-[var(--theme-400)] opacity-95 leading-relaxed">{annotationText}</p>
        </div>
    ) : null;

    // If the line is empty (neither text nor annotation), render nothing.
    if (!mainText.trim() && !annotationElement) {
        return null;
    }
    
    let mainElement = null;

    if (mainText.trim()) {
        if (mainText.toUpperCase().startsWith('CHARACTERS')) {
            mainElement = <h2 className="text-2xl font-bold text-[var(--theme-400)] mt-6">{mainText}</h2>;
        } else if (mainText.toUpperCase().startsWith('SCENE')) {
            mainElement = <h3 className="text-xl font-semibold text-[var(--theme-400)] mt-6">{mainText}</h3>;
        } else {
            // Expanded regex to catch more labels and make them bold
            const labelRegex = /^\s*(Setting|Characters|Action|Emotion\/Lesson|Species|Detailed Appearance|Visual Style Keywords):/;
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


const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, isLoading, storyTitle }) => {
    const [showAnnotations, setShowAnnotations] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

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

    if (isLoading && !script) {
        return null; // Don't show anything until loading is done or script is available
    }

    const stripAnnotations = (text: string): string => {
        const annotationRegex = /\s*\([^)]+\)([:.]*)$/;
        return text
            .split('\n')
            .map(line => {
                const match = line.match(annotationRegex);
                if (match) {
                    return (line.substring(0, match.index) + (match[2] || '')).trimEnd();
                }
                return line;
            })
            .join('\n');
    };

    const formatScriptForDownload = (text: string): string => {
        const annotationRegex = /\s*\(([^)]+)\)([:.]*)$/;
        return text
            .split('\n')
            .map(line => {
                const match = line.match(annotationRegex);
                if (match) {
                    const mainText = (line.substring(0, match.index) + (match[2] || '')).trimEnd();
                    const annotation = `(${match[1]})`;
                    if (!mainText.trim()) {
                        return annotation;
                    }
                    return `${mainText}\n${annotation}`;
                }
                return line;
            })
            .join('\n');
    };
    
    const handleDownload = (withAnnotations: boolean) => {
        if (!script) return;
        
        const content = withAnnotations ? formatScriptForDownload(script) : stripAnnotations(script);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const cleanTitle = storyTitle ? storyTitle.split('(')[0].trim() : 'untitled_script';
        const filenameBase = cleanTitle
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();

        const annotationSuffix = withAnnotations ? 'with' : 'without';
        link.download = `script_pixar_${filenameBase}_${annotationSuffix}_VN.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloadMenuOpen(false); // Close menu after download
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
                      
                      <div className="relative" ref={downloadMenuRef}>
                        <button
                          onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-gray-700 hover:bg-gray-600 text-gray-300"
                          title="Tải kịch bản"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        {isDownloadMenuOpen && (
                          <div className="absolute top-full right-0 mt-2 w-max bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 p-1">
                            <ul>
                              <li>
                                <button
                                  onClick={() => handleDownload(true)}
                                  className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-700 text-gray-300 transition-colors"
                                >
                                  Tải về (Có chú thích)
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => handleDownload(false)}
                                  className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-700 text-gray-300 transition-colors"
                                >
                                  Tải về (Không chú thích)
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

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