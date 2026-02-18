'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { apiRequest } from '@/shared/api/http-client';
import { Drawer } from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/input';
import { useAppStore } from '@/shared/store/app-store';

export function AlwaysOnAIButton() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const userId = useAppStore((state) => state.userId) || '00000000-0000-0000-0000-000000000001';
  const tenantId = useAppStore((state) => state.tenantId) || '00000000-0000-0000-0000-000000000001';

  const canSend = useMemo(() => prompt.trim().length > 0, [prompt]);

  const quickChat = useMutation({
    mutationFn: (message: string) =>
      apiRequest<{ message: string; blocked?: boolean; reason?: string }>('gateway', '/v1/ai/chat', {
        method: 'POST',
        body: {
          userId,
          tenantId,
          mode: 'career_advice',
          messages: [{ role: 'user', content: message }]
        }
      })
  });

  return (
    <>
      <button
        aria-label="Open AI quick assistant"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-line bg-accent px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-accent/90"
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={16} />
        AI Help
      </button>

      <Drawer open={open} title="AI Assistant (Always On)" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Textarea rows={5} label="Ask AI from any mode" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          {error ? <p className="rounded-lg border border-danger/40 bg-danger/10 p-2 text-xs text-danger">{error}</p> : null}
          <Button
            className="w-full"
            disabled={!canSend || quickChat.isPending}
            onClick={async () => {
              if (!canSend) {
                return;
              }
              setError('');
              setResponse('');

              try {
                const result = await quickChat.mutateAsync(prompt);
                if (result.blocked) {
                  setError(result.reason ?? 'Feature locked');
                  return;
                }

                setResponse(result.message);
              } catch (reason) {
                setError(reason instanceof Error ? reason.message : 'AI request failed');
              }
            }}
          >
            {quickChat.isPending ? 'Thinking...' : 'Ask'}
          </Button>
          <div className="whitespace-pre-wrap rounded-lg border border-line bg-bg p-3 text-sm text-muted">
            {response || 'Response appears here...'}
          </div>
        </div>
      </Drawer>
    </>
  );
}
