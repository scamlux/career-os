'use client';

import { useAppStore } from '@/shared/store/app-store';
import { Button } from '@/shared/components/ui/button';

export function RightPanel() {
  const mode = useAppStore((state) => state.rightPanelMode);
  const setMode = useAppStore((state) => state.setRightPanelMode);
  const aiCredits = useAppStore((state) => state.aiCredits);

  return (
    <aside className="sticky top-0 h-screen w-[320px] border-l border-line bg-panel/60 p-4 backdrop-blur">
      <h2 className="text-sm font-semibold text-text">Context Panel</h2>
      <div className="mt-2 rounded-lg border border-line bg-bg p-3 text-sm text-muted">
        <p>AI Credits: <span className="font-semibold text-text">{aiCredits}</span></p>
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant={mode === 'assistant' ? 'primary' : 'ghost'} onClick={() => setMode('assistant')}>Assistant</Button>
        <Button variant={mode === 'inspector' ? 'primary' : 'ghost'} onClick={() => setMode('inspector')}>Inspector</Button>
        <Button variant={mode === 'activity' ? 'primary' : 'ghost'} onClick={() => setMode('activity')}>Activity</Button>
      </div>

      <section className="mt-4 rounded-lg border border-line bg-bg p-3 text-sm text-muted">
        {mode === 'assistant' ? <p>Use this panel for AI context, suggestions and prompt memory.</p> : null}
        {mode === 'inspector' ? <p>Inspector mode shows node metadata and conflict details.</p> : null}
        {mode === 'activity' ? <p>Recent events, API retries, and websocket diagnostics appear here.</p> : null}
      </section>
    </aside>
  );
}
