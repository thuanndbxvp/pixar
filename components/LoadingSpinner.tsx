import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-400)]"></div>
      <p className="mt-4 text-gray-400">AI đang suy nghĩ...</p>
    </div>
  );
};

export default LoadingSpinner;