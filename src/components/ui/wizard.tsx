import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export type WizardStep = {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
};

type WizardProps = {
  steps: WizardStep[];
  defaultStepId?: string;
  activeStepId?: string;
  onStepChange?: (stepId: string) => void;
  className?: string;
  renderFooter?: (helpers: {
    isFirst: boolean;
    isLast: boolean;
    goNext: () => void;
    goPrev: () => void;
    currentIndex: number;
    total: number;
  }) => React.ReactNode;
};

export function Wizard({
  steps,
  defaultStepId,
  activeStepId,
  onStepChange,
  className,
  renderFooter,
}: WizardProps) {
  const firstStepId = steps[0]?.id;
  const initialId = defaultStepId || firstStepId;
  const [internalStep, setInternalStep] = useState(initialId);

  const currentStepId = activeStepId ?? internalStep;
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStepId)
  );
  const total = steps.length;
  const currentStep = steps[currentIndex];

  const setStep = (stepId: string) => {
    if (!activeStepId) {
      setInternalStep(stepId);
    }
    onStepChange?.(stepId);
  };

  const goNext = () => {
    if (currentIndex < total - 1) {
      setStep(steps[currentIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].id);
    }
  };

  const progress = useMemo(() => {
    if (total <= 1) return 100;
    return Math.round(((currentIndex + 1) / total) * 100);
  }, [currentIndex, total]);

  if (!currentStep) return null;

  return (
    <div className={cn('space-y-5', className)}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setStep(step.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                  isActive
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                    : index < currentIndex
                      ? 'border-gray-200 text-gray-600 hover:border-gray-300'
                      : 'border-gray-100 text-gray-400'
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold shadow">
                  {index + 1}
                </span>
                {step.title}
              </button>
            );
          })}
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-[#FF6B35] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {currentStep.description ? (
          <p className="text-sm text-gray-500">{currentStep.description}</p>
        ) : null}
      </div>

      <div>{currentStep.content}</div>

      {renderFooter ? (
        renderFooter({
          isFirst: currentIndex === 0,
          isLast: currentIndex === total - 1,
          goNext,
          goPrev,
          currentIndex,
          total,
        })
      ) : (
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-50"
          >
            Indietro
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === total - 1}
            className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white hover:bg-[#ff8555] disabled:opacity-50"
          >
            Avanti
          </button>
        </div>
      )}
    </div>
  );
}
