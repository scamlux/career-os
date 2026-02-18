'use client';

import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { apiRequest } from '@/shared/api/http-client';
import { AIMessageBlock } from '@/shared/components/ui/ai-message-block';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/input';
import { useAppStore } from '@/shared/store/app-store';

type SessionPromptType = 'about_platform' | 'career_advice' | 'soft_skills' | 'interview';

const starterPrompts: Record<SessionPromptType, string[]> = {
  about_platform: [
    'Объясни, как связаны режимы AI-HR, Roadmap и Courses в CareerOS.',
    'Как мне использовать платформу первые 7 дней максимально эффективно?'
  ],
  career_advice: [
    'Хочу перейти в backend за 8 месяцев. С чего стартовать?',
    'Помоги выбрать между frontend и data engineering с моим профилем.'
  ],
  soft_skills: [
    'Собери мне план прокачки коммуникации для собеседований.',
    'Как развить системное мышление и лидерские навыки в команде?'
  ],
  interview: [
    'Проведи mock interview на Middle Backend и дай фидбек.',
    'Дай 5 сложных вопросов по system design и оцени ответы.'
  ]
};

export function AIHRMode() {
  const aiSessions = useAppStore((state) => state.aiSessions);
  const currentAISessionId = useAppStore((state) => state.currentAISessionId);
  const setCurrentAISession = useAppStore((state) => state.setCurrentAISession);
  const startAISession = useAppStore((state) => state.startAISession);
  const appendAIMessage = useAppStore((state) => state.appendAIMessage);
  const userId = useAppStore((state) => state.userId) || '00000000-0000-0000-0000-000000000001';
  const tenantId = useAppStore((state) => state.tenantId) || '00000000-0000-0000-0000-000000000001';

  const [input, setInput] = useState('');
  const [promptType, setPromptType] = useState<SessionPromptType>('career_advice');
  const [error, setError] = useState('');

  const currentSession = useMemo(
    () => aiSessions.find((session) => session.id === currentAISessionId) ?? aiSessions[0],
    [aiSessions, currentAISessionId]
  );

  const chatMutation = useMutation({
    mutationFn: (messages: Array<{ role: string; content: string }>) =>
      apiRequest<{ message: string; model: string; blocked?: boolean; reason?: string }>('gateway', '/v1/ai/chat', {
        method: 'POST',
        body: {
          userId,
          tenantId,
          mode: promptType,
          messages
        }
      })
  });

  const send = async () => {
    const content = input.trim();
    if (!content || !currentSession) {
      return;
    }

    setError('');

    const userMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`,
      role: 'user' as const,
      content,
      createdAt: Date.now()
    };

    appendAIMessage(userMessage);
    setInput('');

    const messages = [...currentSession.messages, userMessage].map((item) => ({
      role: item.role,
      content: item.content
    }));

    try {
      const response = await chatMutation.mutateAsync(messages);
      if (response.blocked) {
        setError(response.reason ?? 'Feature is locked by current plan');
        return;
      }

      appendAIMessage({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.message,
        createdAt: Date.now()
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'AI chat failed');
    }
  };

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[300px_1fr_320px]">
      <aside className="panel h-[calc(100vh-11rem)] overflow-auto">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Conversations</h3>
          <Button variant="ghost" className="px-2 py-1" onClick={() => startAISession('AI Mentor Session')}>
            New
          </Button>
        </div>

        <div className="space-y-2">
          {aiSessions.map((session) => (
            <button
              key={session.id}
              className={`w-full rounded-xl border px-3 py-3 text-left ${session.id === currentAISessionId ? 'border-accent bg-accent/10 text-text' : 'border-line bg-bg text-muted hover:border-line/70'}`}
              onClick={() => setCurrentAISession(session.id)}
            >
              <p className="text-sm font-medium">{session.title}</p>
              <p className="mt-1 text-xs opacity-80">{session.messages.length} messages</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="panel flex h-[calc(100vh-11rem)] flex-col overflow-hidden">
        <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="text-sm font-semibold text-text">AI-HR Mentor Workspace</h3>
            <p className="text-xs text-muted">Career consulting, role fit, interview prep, soft-skills coaching.</p>
          </div>
          <label className="text-xs text-muted">
            Mode
            <select
              className="ml-2 rounded-lg border border-line bg-bg px-2 py-1 text-xs text-text"
              value={promptType}
              onChange={(event) => setPromptType(event.target.value as SessionPromptType)}
            >
              <option value="about_platform">About Platform</option>
              <option value="career_advice">Career Advice</option>
              <option value="soft_skills">Soft Skills</option>
              <option value="interview">Interview Coach</option>
            </select>
          </label>
        </div>

        <div className="flex-1 space-y-3 overflow-auto rounded-xl border border-line bg-bg/80 p-3">
          {currentSession?.messages.map((message) => (
            <AIMessageBlock key={message.id} role={message.role === 'assistant' ? 'ai' : 'user'} content={message.content} />
          ))}
          {chatMutation.isPending ? <AIMessageBlock role="ai" content="Thinking..." /> : null}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            {starterPrompts[promptType].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-muted hover:text-text"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <Textarea
            rows={4}
            label="Your message"
            placeholder="Опиши цель, ограничения по времени, текущий опыт и куда хочешь выйти"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          {error ? <p className="rounded-lg border border-danger/40 bg-danger/10 p-2 text-xs text-danger">{error}</p> : null}
          <Button onClick={send} disabled={chatMutation.isPending || !input.trim()}>
            {chatMutation.isPending ? 'AI отвечает...' : 'Send to AI Mentor'}
          </Button>
        </div>
      </section>

      <aside className="panel h-[calc(100vh-11rem)] space-y-3 overflow-auto">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Live Profile</h3>
        <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
          <p className="font-medium text-text">Career focus</p>
          <p className="mt-1">{promptType === 'career_advice' ? 'Role discovery & transition' : 'Guided mentoring'}</p>
        </div>
        <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
          <p className="font-medium text-text">AI recommendations</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Сформулируй целевой role + grade</li>
            <li>Укажи дедлайн и weekly load</li>
            <li>Добавь 2 soft-skills для оценки</li>
          </ul>
        </div>
        <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
          <p className="font-medium text-text">Connection</p>
          <p className="mt-1">Backend endpoint: `/v1/ai/chat`</p>
        </div>
      </aside>
    </div>
  );
}
