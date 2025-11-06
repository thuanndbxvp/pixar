import React from 'react';

interface ScriptDisplayProps {
    script: string;
    isLoading: boolean;
}

// A simple component to render the script text with some basic formatting
const FormattedScript: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\n---\n)/g); // Split by separator but keep it
  
  return (
    <div className="space-y-6">
      {parts.map((part, index) => {
        if (part.trim() === '---') {
          return <hr key={index} className="border-gray-600" />;
        }
        
        return (
          <div key={index}>
            {part.split('\n').map((line, lineIndex) => {
              if (line.toUpperCase().startsWith('CHARACTERS')) {
                return <h2 key={lineIndex} className="text-2xl font-bold text-[var(--theme-400)] mt-4 mb-2">{line}</h2>;
              }
              if (line.toUpperCase().startsWith('SCENE')) {
                return <h3 key={lineIndex} className="text-xl font-semibold text-[var(--theme-400)] mt-4 mb-2">{line}</h3>;
              }
              if (line.match(/^\s*(Setting|Characters|Action|Emotion\/Lesson):/)) {
                return (
                  <p key={lineIndex} className="text-gray-300">
                    <span className="font-semibold text-gray-200">{line.substring(0, line.indexOf(':') + 1)}</span>
                    {line.substring(line.indexOf(':') + 1)}
                  </p>
                );
              }
              return <p key={lineIndex} className="text-gray-300">{line}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};


const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, isLoading }) => {
    if (isLoading && !script) {
        return null; // Don't show anything until loading is done or script is available
    }

    return (
        <div className="prose prose-invert prose-p:text-gray-300 max-w-none bg-gray-900/50 p-6 rounded-lg ring-1 ring-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-center text-[var(--theme-400)]">Kịch bản được tạo</h2>
            {script ? <FormattedScript text={script} /> : <p>Đang tạo kịch bản của bạn...</p>}
        </div>
    );
};

export default ScriptDisplay;