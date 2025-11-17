import React from 'react';
import type { Story } from '../types';
import ActionButton from './ActionButton';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface StorySelectionProps {
  stories: Story[];
  onSelect: (story: Story) => void;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

const StorySelection: React.FC<StorySelectionProps> = ({ stories, onSelect, onLoadMore, isLoadingMore }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-center text-[var(--theme-400)]">Chọn một câu chuyện</h2>
      <p className="text-gray-400 text-center mb-6">Bạn muốn tôi phát triển câu chuyện nào thành kịch bản chi tiết?</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-[var(--theme-500)] hover:shadow-lg hover:shadow-[var(--theme-500)]/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => onSelect(story)}
          >
            <h3 className="font-bold text-lg text-[var(--theme-400)] mb-2">{story.title}</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{story.content.substring(0, 150)}...</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <ActionButton
          onClick={onLoadMore}
          Icon={SparklesIcon}
          text={isLoadingMore ? 'Đang tải...' : 'Tải thêm gợi ý'}
          disabled={isLoadingMore}
        />
      </div>
    </div>
  );
};

export default StorySelection;