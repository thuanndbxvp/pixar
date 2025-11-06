import React from 'react';
import type { AppStep } from '../types';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
  onStepClick: (stepIndex: number) => void;
  canNavigateTo: boolean[];
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

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick, canNavigateTo }) => {
  const activeIndex = getStepIndex(currentStep);
  const distinctSteps = ['Ý tưởng', 'Kịch bản', 'Gợi ý'];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {distinctSteps.map((label, index) => {
          const isActive = index <= activeIndex;
          // A step is clickable if its data exists and it's not the currently active step.
          const isClickable = canNavigateTo[index] && index !== activeIndex;

          return (
            <React.Fragment key={label}>
              <button
                onClick={() => onStepClick(index)}
                disabled={!isClickable}
                className={`flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-500)] rounded-lg p-1 ${isClickable ? 'cursor-pointer group' : 'cursor-default'}`}
                aria-label={isClickable ? `Go to step ${index + 1}: ${label}` : label}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-[var(--theme-500)]' : 'bg-gray-600'
                  } ${isClickable ? 'group-hover:scale-110' : ''}`}
                >
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <p className={`mt-2 text-sm font-medium ${isActive ? 'text-[var(--theme-400)]' : 'text-gray-500'}`}>
                  {label}
                </p>
              </button>
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
