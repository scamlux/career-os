'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { apiRequest } from '@/shared/api/http-client';
import { Button } from '@/shared/components/ui/button';
import { CanvasContainer } from '@/shared/components/ui/canvas-container';
import { Input, Textarea } from '@/shared/components/ui/input';
import { SkillNode } from '@/shared/components/ui/skill-node';
import { useAppStore } from '@/shared/store/app-store';

type DraftRecord = {
  id: string;
  title: string;
  roleTarget: string;
  grade: string;
  interviewLog: Array<{ question: string; answer: string }>;
  nodes: Array<{ id: string; label: string; progress: number; x: number; y: number }>;
  viewport: { x: number; y: number; scale: number };
  createdAt: number;
  updatedAt: number;
};

type InterviewTurnResponse = {
  draft_id: string;
  next_question: string;
  status: string;
  summary: string;
  ai_execution_id: string;
};

type DraftApiResponse = {
  id: string;
  title: string;
  target_role: string;
  target_grade: string;
  interview_log_json: string;
  roadmap_nodes_json: string;
  canvas_viewport_json: string;
  created_at: string;
  updated_at: string;
};

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_QUESTION = 'Какая профессия или роль тебя интересует?';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseJsonValue<T>(value: string, fallback: T): T {
  try {
    const parsed = JSON.parse(value) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function mapDraftRecord(item: DraftApiResponse): DraftRecord {
  return {
    id: item.id,
    title: item.title,
    roleTarget: item.target_role,
    grade: item.target_grade,
    interviewLog: parseJsonValue(item.interview_log_json, []),
    nodes: parseJsonValue(item.roadmap_nodes_json, []),
    viewport: parseJsonValue(item.canvas_viewport_json, { x: 0, y: 0, scale: 1 }),
    createdAt: Date.parse(item.created_at),
    updatedAt: Date.parse(item.updated_at)
  };
}

export function RoadmapMode() {
  const roadmapNodes = useAppStore((state) => state.roadmapNodes);
  const setRoadmapNodes = useAppStore((state) => state.setRoadmapNodes);
  const roadmapViewport = useAppStore((state) => state.roadmapViewport);
  const setRoadmapViewport = useAppStore((state) => state.setRoadmapViewport);
  const roadmapDiscovery = useAppStore((state) => state.roadmapDiscovery);
  const addRoadmapDiscoveryAnswer = useAppStore((state) => state.addRoadmapDiscoveryAnswer);
  const clearRoadmapDiscovery = useAppStore((state) => state.clearRoadmapDiscovery);
  const addRoadmapDraft = useAppStore((state) => state.addRoadmapDraft);
  const roadmapDrafts = useAppStore((state) => state.roadmapDrafts);
  const setRoadmapDrafts = useAppStore((state) => state.setRoadmapDrafts);
  const activeRoadmapDraftId = useAppStore((state) => state.activeRoadmapDraftId);
  const setActiveRoadmapDraftId = useAppStore((state) => state.setActiveRoadmapDraftId);
  const userId = useAppStore((state) => state.userId) || DEFAULT_USER_ID;
  const tenantId = useAppStore((state) => state.tenantId) || DEFAULT_TENANT_ID;

  const [creating, setCreating] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(DEFAULT_QUESTION);
  const [answer, setAnswer] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [interviewStatus, setInterviewStatus] = useState<string>('');

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef(roadmapViewport);
  const nodesRef = useRef(roadmapNodes);
  const pendingViewportRef = useRef(roadmapViewport);
  const pendingNodesRef = useRef(roadmapNodes);
  const viewportRafRef = useRef<number | null>(null);
  const nodeRafRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const panRef = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0
  });

  const nodeDragRef = useRef<{
    active: boolean;
    nodeId: string;
    startPointerX: number;
    startPointerY: number;
    nodeStartX: number;
    nodeStartY: number;
  } | null>(null);

  useEffect(() => {
    viewportRef.current = roadmapViewport;
  }, [roadmapViewport]);

  useEffect(() => {
    nodesRef.current = roadmapNodes;
  }, [roadmapNodes]);

  const scheduleViewport = useCallback(
    (next: { x: number; y: number; scale: number }) => {
      pendingViewportRef.current = next;
      if (viewportRafRef.current !== null) {
        return;
      }

      viewportRafRef.current = window.requestAnimationFrame(() => {
        viewportRafRef.current = null;
        setRoadmapViewport(pendingViewportRef.current);
      });
    },
    [setRoadmapViewport]
  );

  const scheduleNodes = useCallback(
    (next: Array<{ id: string; label: string; progress: number; x: number; y: number }>) => {
      pendingNodesRef.current = next;
      if (nodeRafRef.current !== null) {
        return;
      }

      nodeRafRef.current = window.requestAnimationFrame(() => {
        nodeRafRef.current = null;
        setRoadmapNodes(pendingNodesRef.current);
      });
    },
    [setRoadmapNodes]
  );

  const draftsQuery = useQuery({
    queryKey: ['roadmap-drafts', userId],
    queryFn: () => apiRequest<{ items: DraftApiResponse[] }>('gateway', `/v1/roadmaps/drafts/${userId}`),
    refetchOnWindowFocus: false
  });

  const createDraftMutation = useMutation({
    mutationFn: (payload: {
      title?: string;
      targetRole?: string;
      targetGrade?: string;
      interviewLog?: Array<{ question: string; answer: string }>;
      roadmapNodes?: Array<{ id: string; label: string; progress: number; x: number; y: number }>;
      canvasViewport?: { x: number; y: number; scale: number };
    }) =>
      apiRequest<DraftApiResponse>('gateway', '/v1/roadmaps/drafts', {
        method: 'POST',
        body: {
          userId,
          tenantId,
          ...payload
        }
      })
  });

  const interviewMutation = useMutation({
    mutationFn: (payload: { draftId?: string; messages: Array<{ question: string; answer: string }> }) =>
      apiRequest<InterviewTurnResponse>('gateway', '/v1/roadmaps/interview/turn', {
        method: 'POST',
        body: {
          userId,
          tenantId,
          draftId: payload.draftId,
          messages: payload.messages
        }
      })
  });

  const saveCanvasMutation = useMutation({
    mutationFn: (payload: {
      draftId: string;
      canvasViewport: { x: number; y: number; scale: number };
      roadmapNodes: Array<{ id: string; label: string; progress: number; x: number; y: number }>;
    }) =>
      apiRequest<DraftApiResponse>('gateway', `/v1/roadmaps/drafts/${payload.draftId}/canvas`, {
        method: 'PATCH',
        body: {
          userId,
          canvasViewport: payload.canvasViewport,
          roadmapNodes: payload.roadmapNodes
        }
      })
  });

  useEffect(() => {
    if (!draftsQuery.data?.items) {
      return;
    }

    const records = draftsQuery.data.items.map(mapDraftRecord);

    setRoadmapDrafts(
      records.map((item) => ({
        id: item.id,
        title: item.title,
        roleTarget: item.roleTarget,
        grade: item.grade,
        interviewLog: item.interviewLog,
        roadmapNodes: item.nodes,
        canvasViewport: item.viewport,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    );

    if (!activeRoadmapDraftId && records[0]) {
      setActiveRoadmapDraftId(records[0].id);
      if (records[0].nodes.length > 0) {
        setRoadmapNodes(records[0].nodes);
      }
      setRoadmapViewport(records[0].viewport);
      clearRoadmapDiscovery();
      records[0].interviewLog.forEach((item) => addRoadmapDiscoveryAnswer(item));
      const lastQuestion = records[0].interviewLog[records[0].interviewLog.length - 1]?.question;
      setActiveQuestion(lastQuestion ?? DEFAULT_QUESTION);
    }
  }, [
    activeRoadmapDraftId,
    addRoadmapDiscoveryAnswer,
    clearRoadmapDiscovery,
    draftsQuery.data?.items,
    setActiveRoadmapDraftId,
    setRoadmapDrafts,
    setRoadmapNodes,
    setRoadmapViewport
  ]);

  useEffect(() => {
    if (!activeRoadmapDraftId) {
      return;
    }

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveCanvasMutation.mutate({
        draftId: activeRoadmapDraftId,
        canvasViewport: viewportRef.current,
        roadmapNodes: nodesRef.current
      });
    }, 450);

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [activeRoadmapDraftId, roadmapNodes, roadmapViewport, saveCanvasMutation]);

  const selectedNode = useMemo(() => roadmapNodes.find((node) => node.id === selectedNodeId) ?? null, [roadmapNodes, selectedNodeId]);
  const roadmapLinks = useMemo(() => {
    if (roadmapNodes.length < 2) {
      return [];
    }

    const sorted = [...roadmapNodes].sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
    const links: Array<{ id: string; from: { x: number; y: number }; to: { x: number; y: number } }> = [];
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const from = sorted[i];
      const to = sorted[i + 1];
      links.push({
        id: `${from.id}-${to.id}`,
        from: { x: from.x + 72, y: from.y + 24 },
        to: { x: to.x + 72, y: to.y + 24 }
      });
    }

    return links;
  }, [roadmapNodes]);

  const startInterview = async () => {
    if (!activeRoadmapDraftId) {
      const draft = await createDraftMutation.mutateAsync({
        title: 'AI Roadmap Interview Draft',
        interviewLog: roadmapDiscovery,
        roadmapNodes,
        canvasViewport: roadmapViewport
      });
      const mapped = mapDraftRecord(draft);
      setActiveRoadmapDraftId(mapped.id);
      addRoadmapDraft({
        id: mapped.id,
        title: mapped.title,
        roleTarget: mapped.roleTarget,
        grade: mapped.grade,
        interviewLog: mapped.interviewLog,
        roadmapNodes: mapped.nodes,
        canvasViewport: mapped.viewport,
        createdAt: mapped.createdAt,
        updatedAt: mapped.updatedAt
      });
    }

    setCreating(true);
  };

  const pushAnswer = async () => {
    const value = answer.trim();
    if (!value) {
      return;
    }

    const message = { question: activeQuestion, answer: value };
    const nextMessages = [...roadmapDiscovery, message];
    addRoadmapDiscoveryAnswer(message);
    setAnswer('');

    const response = await interviewMutation.mutateAsync({
      draftId: activeRoadmapDraftId || undefined,
      messages: nextMessages
    });

    if (!activeRoadmapDraftId && response.draft_id) {
      setActiveRoadmapDraftId(response.draft_id);
    }

    setInterviewStatus(response.summary);
    setActiveQuestion(response.next_question || DEFAULT_QUESTION);
  };

  const createRoadmapDraft = async () => {
    const target = roadmapDiscovery.find((item) => item.question.toLowerCase().includes('роль'))?.answer || 'Custom Role';
    const draft = await createDraftMutation.mutateAsync({
      title: `Roadmap Draft • ${target}`,
      targetRole: target,
      targetGrade: 'Custom',
      interviewLog: roadmapDiscovery,
      roadmapNodes,
      canvasViewport: roadmapViewport
    });

    const mapped = mapDraftRecord(draft);
    setActiveRoadmapDraftId(mapped.id);
    addRoadmapDraft({
      id: mapped.id,
      title: mapped.title,
      roleTarget: mapped.roleTarget,
      grade: mapped.grade,
      interviewLog: mapped.interviewLog,
      roadmapNodes: mapped.nodes,
      canvasViewport: mapped.viewport,
      createdAt: mapped.createdAt,
      updatedAt: mapped.updatedAt
    });
    setCreating(false);
  };

  const loadDraft = (draftId: string) => {
    setActiveRoadmapDraftId(draftId);
    const draft = roadmapDrafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    if (draft.roadmapNodes && draft.roadmapNodes.length > 0) {
      setRoadmapNodes(draft.roadmapNodes);
    }

    if (draft.canvasViewport) {
      setRoadmapViewport(draft.canvasViewport);
    }

    clearRoadmapDiscovery();
    (draft.interviewLog ?? []).forEach((item) => addRoadmapDiscoveryAnswer(item));
    const lastQuestion = draft.interviewLog?.[draft.interviewLog.length - 1]?.question;
    setActiveQuestion(lastQuestion ?? DEFAULT_QUESTION);
  };

  const onCanvasPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    panRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      baseX: viewportRef.current.x,
      baseY: viewportRef.current.y
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onCanvasPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (nodeDragRef.current?.active) {
      const drag = nodeDragRef.current;
      const dx = (event.clientX - drag.startPointerX) / viewportRef.current.scale;
      const dy = (event.clientY - drag.startPointerY) / viewportRef.current.scale;
      const nextNodes = nodesRef.current.map((node) =>
        node.id === drag.nodeId
          ? {
              ...node,
              x: drag.nodeStartX + dx,
              y: drag.nodeStartY + dy
            }
          : node
      );
      nodesRef.current = nextNodes;
      scheduleNodes(nextNodes);
      return;
    }

    if (!panRef.current.active) {
      return;
    }

    const next = {
      ...viewportRef.current,
      x: panRef.current.baseX + (event.clientX - panRef.current.startX),
      y: panRef.current.baseY + (event.clientY - panRef.current.startY)
    };

    viewportRef.current = next;
    scheduleViewport(next);
  };

  const onCanvasPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    panRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onCanvasWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const current = viewportRef.current;
    const zoomDelta = event.deltaY > 0 ? -0.08 : 0.08;
    const nextScale = clamp(current.scale + zoomDelta, 0.45, 2.2);

    const worldX = (pointerX - current.x) / current.scale;
    const worldY = (pointerY - current.y) / current.scale;

    const next = {
      scale: nextScale,
      x: pointerX - worldX * nextScale,
      y: pointerY - worldY * nextScale
    };

    viewportRef.current = next;
    scheduleViewport(next);
  };

  const onNodePointerDown = (id: string, event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSelectedNodeId(id);

    const node = nodesRef.current.find((item) => item.id === id);
    if (!node) {
      return;
    }

    nodeDragRef.current = {
      active: true,
      nodeId: id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onNodePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    nodeDragRef.current = null;
  };

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[1fr_360px]">
      <section className="space-y-3">
        <div className="panel flex flex-wrap items-center gap-2">
          <Button onClick={startInterview} disabled={createDraftMutation.isPending || interviewMutation.isPending}>
            Create Roadmap
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const next = { ...viewportRef.current, scale: clamp(viewportRef.current.scale + 0.1, 0.45, 2.2) };
              viewportRef.current = next;
              scheduleViewport(next);
            }}
          >
            Zoom +
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const next = { ...viewportRef.current, scale: clamp(viewportRef.current.scale - 0.1, 0.45, 2.2) };
              viewportRef.current = next;
              scheduleViewport(next);
            }}
          >
            Zoom -
          </Button>
          <span className="rounded-full border border-line px-2 py-1 text-xs text-muted">Zoom {roadmapViewport.scale.toFixed(2)}x</span>
          <span className="rounded-full border border-line px-2 py-1 text-xs text-muted">Nodes {roadmapNodes.length}</span>
          <span className="ml-auto rounded-full border border-line px-2 py-1 text-xs text-muted">
            Draft {activeRoadmapDraftId ? 'connected' : 'not selected'}
          </span>
        </div>

        <CanvasContainer>
          <div
            ref={canvasRef}
            className="absolute inset-0 cursor-grab touch-none bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.09)_1px,transparent_0)] bg-[size:22px_22px]"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerLeave={onCanvasPointerUp}
            onWheel={onCanvasWheel}
          >
            <div
              className="absolute left-0 top-0 h-[2200px] w-[2200px] will-change-transform"
              style={{
                transform: `translate3d(${roadmapViewport.x}px, ${roadmapViewport.y}px, 0) scale(${roadmapViewport.scale})`,
                transformOrigin: '0 0'
              }}
            >
              <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                {roadmapLinks.map((link) => (
                  <line
                    key={link.id}
                    x1={link.from.x}
                    y1={link.from.y}
                    x2={link.to.x}
                    y2={link.to.y}
                    stroke="hsl(var(--line))"
                    strokeWidth={1.2}
                    strokeDasharray="5 5"
                  />
                ))}
              </svg>
              {roadmapNodes.map((node) => (
                <SkillNode
                  key={node.id}
                  id={node.id}
                  label={node.label}
                  progress={node.progress}
                  x={node.x}
                  y={node.y}
                  selected={selectedNode?.id === node.id}
                  onPointerDown={onNodePointerDown}
                  onPointerUp={onNodePointerUp}
                  onClick={setSelectedNodeId}
                />
              ))}
            </div>
          </div>
        </CanvasContainer>
      </section>

      <aside className="panel h-[calc(100vh-11rem)] space-y-3 overflow-auto">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Roadmap Studio</h3>
        {creating ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
              <p className="font-medium text-text">AI discovery question</p>
              <p className="mt-1">{activeQuestion}</p>
            </div>
            <Textarea rows={4} label="Your answer" value={answer} onChange={(event) => setAnswer(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={pushAnswer} disabled={interviewMutation.isPending || !answer.trim()}>
                Next AI Question
              </Button>
              <Button variant="ghost" onClick={createRoadmapDraft} disabled={createDraftMutation.isPending}>
                Save Draft
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  clearRoadmapDiscovery();
                  setActiveQuestion(DEFAULT_QUESTION);
                  setAnswer('');
                  setInterviewStatus('');
                }}
              >
                Reset Interview
              </Button>
            </div>
            <p className="text-xs text-muted">
              {interviewStatus || 'Roadmap interview is backend-driven and keeps accumulating context before each generation pass.'}
            </p>
          </div>
        ) : (
          <Button onClick={startInterview} disabled={createDraftMutation.isPending}>
            Start AI Roadmap Interview
          </Button>
        )}

        <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
          <p className="font-medium text-text">Collected answers</p>
          <p className="mt-1">{roadmapDiscovery.length} items</p>
        </div>

        <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
          <p className="font-medium text-text">Drafts</p>
          <div className="mt-2 space-y-2">
            {roadmapDrafts.length === 0 ? <p>No drafts yet.</p> : null}
            {roadmapDrafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                className={`w-full rounded border p-2 text-left ${activeRoadmapDraftId === draft.id ? 'border-accent' : 'border-line/80'}`}
                onClick={() => loadDraft(draft.id)}
              >
                <p className="text-text">{draft.title || draft.roleTarget || 'Roadmap draft'}</p>
                <p className="text-xs">{new Date(draft.updatedAt ?? draft.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedNode ? (
          <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
            <p className="font-medium text-text">Node Inspector</p>
            <p>{selectedNode.label}</p>
            <Input
              label="Progress"
              type="number"
              value={String(selectedNode.progress)}
              onChange={(event) => {
                const next = Number(event.target.value);
                const nextNodes = roadmapNodes.map((node) =>
                  node.id === selectedNode.id ? { ...node, progress: Math.max(0, Math.min(100, next)) } : node
                );
                nodesRef.current = nextNodes;
                setRoadmapNodes(nextNodes);
              }}
            />
          </div>
        ) : null}
      </aside>
    </div>
  );
}
