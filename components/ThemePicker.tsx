import React, { useState, useEffect, useRef } from 'react';
import { themeColors, type ThemeName } from '../themes';
import { CheckIcon, PaintBrushIcon } from '@heroicons/react/24/solid';

interface ThemePickerProps {
  selectedTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ selectedTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleThemeSelect = (themeName: ThemeName) => {
    onThemeChange(themeName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg transition-colors"
        aria-label="Choose theme"
      >
        <PaintBrushIcon className="w-5 h-5" style={{ color: themeColors[selectedTheme][400] }}/>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 p-2">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(themeColors) as ThemeName[]).map((themeName) => (
              <button
                key={themeName}
                onClick={() => handleThemeSelect(themeName)}
                className="w-full h-10 rounded-md transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white flex items-center justify-center"
                style={{ backgroundColor: themeColors[themeName][500] }}
                aria-label={`Select ${themeName} theme`}
              >
                {selectedTheme === themeName && <CheckIcon className="w-5 h-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePicker;