
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  Icon: React.ElementType;
  text: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, Icon, text, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </button>
  );
};

export default ActionButton;
