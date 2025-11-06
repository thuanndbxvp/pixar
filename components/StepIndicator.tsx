import React from 'react';
import type { AppStep } from '../types';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const stepsConfig = [
  { id: Step.IDEATION, label: 'Ideas' },
  { id: Step.STORY_SELECTION, label: 'Ideas' },
  { id: Step.SCRIPT_GENERATION, label: 'Script' },
  { id: Step.SCRIPT_GENERATED, label: 'Script' },
  { id: Step.PROMPT_GENERATION, label: 'Prompts' },
  { id: Step.PROMPTS_GENERATED, label: 'Prompts' },
];

const getStepIndex = (currentStep: AppStep): number => {
    switch(currentStep) {
        case Step.IDEATION:
        case Step.STORY_SELECTION:
            return 0;
        case Step.SCRIPT_GENERATION:
        case Step.SCRIPT_GENERATED:
            return 1;
        case Step.PROMPT_GENERATION:
        case Step.PROMPTS_GENERATED:
            return 2;
        default:
            return 0;
    }
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const activeIndex = getStepIndex(currentStep);
  const distinctSteps = ['Ý tưởng', 'Kịch bản', 'Gợi ý'];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {distinctSteps.map((label, index) => {
          const isActive = index <= activeIndex;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-[var(--theme-500)]' : 'bg-gray-600'
                  }`}
                >
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <p className={`mt-2 text-sm font-medium ${isActive ? 'text-[var(--theme-400)]' : 'text-gray-500'}`}>
                  {label}
                </p>
              </div>
              {index < distinctSteps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 transition-all duration-500 ${isActive && index < activeIndex ? 'bg-[var(--theme-500)]' : 'bg-gray-700'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;