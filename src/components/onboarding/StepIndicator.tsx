'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        {labels.map((label, index) => (
          <div
            key={index}
            className={`text-xs font-medium ${
              index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
              index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}