'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ProgressRing } from '@/shared/components/ui/progress-ring';

type WizardState = {
  targetRole: string;
  experienceLevel: string;
  weeklyHours: string;
  interestedInManagement: string;
  preferredMode: string;
};

export function OnboardingWizard({ onDone }: { onDone: (state: WizardState) => void }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    targetRole: '',
    experienceLevel: '',
    weeklyHours: '',
    interestedInManagement: 'no',
    preferredMode: ''
  });

  const steps = useMemo(
    () => [
      {
        key: 'target-role',
        content: (
          <Input
            label="Target role"
            placeholder="e.g. Senior Backend Engineer"
            value={state.targetRole}
            onChange={(event) => setState((prev) => ({ ...prev, targetRole: event.target.value }))}
          />
        )
      },
      {
        key: 'experience',
        content: (
          <Input
            label="Experience level"
            placeholder="e.g. 3 years"
            value={state.experienceLevel}
            onChange={(event) => setState((prev) => ({ ...prev, experienceLevel: event.target.value }))}
          />
        )
      },
      {
        key: 'weekly-hours',
        content: (
          <Input
            label="Weekly learning hours"
            placeholder="e.g. 8"
            value={state.weeklyHours}
            onChange={(event) => setState((prev) => ({ ...prev, weeklyHours: event.target.value }))}
          />
        )
      },
      {
        key: 'management',
        content: (
          <div className="space-y-2 text-sm text-muted">
            <p>Interested in management track?</p>
            <div className="flex gap-2">
              <Button variant={state.interestedInManagement === 'yes' ? 'primary' : 'ghost'} onClick={() => setState((prev) => ({ ...prev, interestedInManagement: 'yes' }))}>
                Yes
              </Button>
              <Button variant={state.interestedInManagement === 'no' ? 'primary' : 'ghost'} onClick={() => setState((prev) => ({ ...prev, interestedInManagement: 'no' }))}>
                No
              </Button>
            </div>
          </div>
        )
      },
      {
        key: 'mode',
        content: (
          <Input
            label="Preferred mode"
            placeholder={state.interestedInManagement === 'yes' ? 'Leadership + technical path' : 'Hands-on engineering path'}
            value={state.preferredMode}
            onChange={(event) => setState((prev) => ({ ...prev, preferredMode: event.target.value }))}
          />
        )
      }
    ],
    [state]
  );

  const progress = ((step + 1) / steps.length) * 100;
  const isLast = step === steps.length - 1;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-bg p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Step {step + 1} / {steps.length}</p>
        <ProgressRing value={progress} size={72} stroke={7} />
      </div>

      <motion.div key={steps[step].key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {steps[step].content}
      </motion.div>

      <div className="flex justify-between gap-2">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((prev) => prev - 1)}>
          Back
        </Button>
        {isLast ? (
          <Button onClick={() => onDone(state)}>Generate Roadmap</Button>
        ) : (
          <Button onClick={() => setStep((prev) => prev + 1)}>Next</Button>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-line bg-panel px-3 py-2 text-xs text-muted">
        <span>Edge case: user can skip onboarding.</span>
        <Button variant="ghost" className="px-2 py-1" onClick={() => onDone(state)}>
          Skip
        </Button>
      </div>
    </div>
  );
}
