'use client';

import { useMemo, useState } from 'react';
import { Accordion } from '@/shared/components/ui/accordion';
import { AIMessageBlock } from '@/shared/components/ui/ai-message-block';
import { Button } from '@/shared/components/ui/button';
import { FeatureGate } from '@/shared/components/navigation/feature-gate';
import { Textarea } from '@/shared/components/ui/input';
import { PageShell } from '@/shared/components/ui/page-shell';
import { apiRequest } from '@/shared/api/http-client';
import { useAppStore } from '@/shared/store/app-store';

type Mode = 'chat' | 'resume' | 'interview';

type HistoryItem = {
  id: string;
  mode: Mode;
  prompt: string;
  response: string;
};

export function AIAssistantView() {
  const [mode, setMode] = useState<Mode>('chat');
  const [prompt, setPrompt] = useState('');
  const [cvText, setCvText] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { userId, tenantId, aiCredits, setAiCredits } = useAppStore((state) => ({
    userId: state.userId,
    tenantId: state.tenantId,
    aiCredits: state.aiCredits,
    setAiCredits: state.setAiCredits
  }));

  const structuredBlocks = useMemo(
    () => [
      { title: 'Summary', content: response ? response.slice(0, 220) : 'Waiting for AI output' },
      { title: 'Recommended actions', content: '1) Complete roadmap stage\n2) Do interview simulation\n3) Finish one LMS module' },
      { title: 'Risk flags', content: aiCredits < 10 ? 'Low credits available' : 'No immediate risk' }
    ],
    [aiCredits, response]
  );

  const runAI = async () => {
    setError(null);

    if (aiCredits <= 0) {
      setError('Token limit reached. Upgrade required.');
      return;
    }

    const finalPrompt = mode === 'resume' ? `${prompt}\n\nCV:\n${cvText}` : prompt;
    if (!finalPrompt.trim()) {
      setError('Prompt is required');
      return;
    }

    setResponse('');

    try {
      if (mode === 'chat') {
        const chat = await apiRequest<{ message: string; blocked?: boolean; reason?: string }>('gateway', '/v1/ai/chat', {
          method: 'POST',
          body: {
            userId,
            tenantId,
            mode: 'career_advice',
            messages: [{ role: 'user', content: finalPrompt }]
          }
        });

        if (chat.blocked) {
          setError(chat.reason ?? 'Feature is locked');
          return;
        }

        setResponse(chat.message);
        setHistory((prev) => [
          {
            id: crypto.randomUUID(),
            mode,
            prompt: finalPrompt,
            response: chat.message
          },
          ...prev
        ]);
      } else {
        const execution = await apiRequest<Record<string, unknown>>('gateway', '/v1/ai/flows/execute', {
          method: 'POST',
          body: {
            userId,
            tenantId,
            flowName: mode === 'resume' ? 'resume_analysis' : 'interview_simulation',
            flowVersion: 'v1',
            input: {
              prompt: finalPrompt,
              cv: cvText
            }
          }
        });

        const executionText = JSON.stringify(execution, null, 2);
        setResponse(executionText);
        setHistory((prev) => [
          {
            id: crypto.randomUUID(),
            mode,
            prompt: finalPrompt,
            response: executionText
          },
          ...prev
        ]);
      }

      setAiCredits(Math.max(0, aiCredits - 1));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'AI timeout');
    }
  };

  const saveAsRoadmap = async () => {
    try {
      await apiRequest('roadmap', '/roadmaps', {
        method: 'POST',
        body: {
          userId,
          tenantId,
          goalKey: 'ai_generated_goal',
          targetRole: 'AI Suggested Role',
          timelineWeeks: 18,
          stageTitles: ['Discover', 'Build', 'Validate', 'Scale']
        }
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to save roadmap');
    }
  };

  return (
    <PageShell title="AI Assistant" subtitle="Streaming consultation, structured outputs, version history and roadmap actions.">
      <div className="grid gap-4 xl:grid-cols-3">
        <section className="panel xl:col-span-2">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button variant={mode === 'chat' ? 'primary' : 'ghost'} onClick={() => setMode('chat')}>
              Chat Mode
            </Button>
            <FeatureGate
              feature="ai_resume_analysis"
              title="Resume analysis locked"
              description="Upgrade to premium to unlock resume analysis."
            >
              <Button variant={mode === 'resume' ? 'primary' : 'ghost'} onClick={() => setMode('resume')}>
                Resume Analysis
              </Button>
            </FeatureGate>
            <FeatureGate
              feature="ai_interview_simulation"
              title="Interview simulation locked"
              description="Premium tier is required for interview simulation mode."
            >
              <Button variant={mode === 'interview' ? 'primary' : 'ghost'} onClick={() => setMode('interview')}>
                Interview Simulation
              </Button>
            </FeatureGate>
          </div>

          <div className="space-y-3">
            <Textarea label="Prompt" rows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
            {mode === 'resume' ? (
              <Textarea
                label="Paste CV"
                rows={5}
                value={cvText}
                onChange={(event) => setCvText(event.target.value)}
                hint="Validation errors and parsing issues are shown below."
              />
            ) : null}
            {error ? <p className="rounded-md border border-danger/40 bg-danger/10 p-2 text-sm text-danger">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button onClick={runAI}>
                Send
              </Button>
              <Button variant="ghost" onClick={saveAsRoadmap}>
                Save as roadmap
              </Button>
              <p className="ml-auto text-xs text-muted">Credits: {aiCredits}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <AIMessageBlock role="user" content={prompt || 'Ask your career question...'} />
            <AIMessageBlock role="ai" content={response || 'Streaming response will appear here.'} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="panel">
            <h3 className="mb-2 text-sm font-semibold text-text">Structured output</h3>
            <Accordion items={structuredBlocks} />
          </div>

          <div className="panel">
            <h3 className="mb-2 text-sm font-semibold text-text">Version history</h3>
            <div className="space-y-2">
              {history.length === 0 ? <p className="text-sm text-muted">No history yet.</p> : null}
              {history.map((item) => (
                <div key={item.id} className="rounded-lg border border-line bg-bg p-2 text-xs text-muted">
                  <p className="font-semibold text-text">{item.mode.toUpperCase()}</p>
                  <p className="mt-1 line-clamp-2">{item.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
