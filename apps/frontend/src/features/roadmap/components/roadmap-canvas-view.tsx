'use client';

import { useMemo, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { FeatureGate } from '@/shared/components/navigation/feature-gate';
import { Button } from '@/shared/components/ui/button';
import { CanvasContainer } from '@/shared/components/ui/canvas-container';
import { Input } from '@/shared/components/ui/input';
import { SkillNode } from '@/shared/components/ui/skill-node';
import { useCanvasEngine } from '@/features/roadmap/hooks/use-canvas-engine';
import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';

function createInitialNodes() {
  const nodes = [] as ReturnType<typeof useCanvasEngine>['nodes'];
  for (let i = 0; i < 220; i += 1) {
    const row = Math.floor(i / 11);
    const col = i % 11;
    nodes.push({
      id: `node-${i + 1}`,
      label: `Skill ${i + 1}`,
      progress: (i * 3) % 100,
      x: col * 170,
      y: row * 112
    });
  }

  return nodes;
}

export function RoadmapCanvasView() {
  const initialNodes = useMemo(() => createInitialNodes(), []);
  const {
    nodes,
    scale,
    offset,
    selectedNode,
    setSelectedNodeId,
    updateNodeProgress,
    onWheel,
    onPointerMove,
    onCanvasPointerDown,
    stopPointerAction,
    startNodeDrag,
    undo
  } = useCanvasEngine(initialNodes);

  const links = useMemo(() => {
    const pairs: Array<{ from: string; to: string }> = [];
    for (let i = 0; i < nodes.length - 1; i += 1) {
      if ((i + 1) % 11 !== 0) {
        pairs.push({ from: nodes[i].id, to: nodes[i + 1].id });
      }
    }
    return pairs;
  }, [nodes]);

  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const visibleNodes = useMemo(() => {
    const viewport = {
      left: -offset.x / scale - 180,
      top: -offset.y / scale - 120,
      right: -offset.x / scale + 1500,
      bottom: -offset.y / scale + 980
    };

    return nodes.filter((node) => node.x >= viewport.left && node.x <= viewport.right && node.y >= viewport.top && node.y <= viewport.bottom);
  }, [nodes, offset, scale]);

  const visibleNodeSet = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const visibleLinks = useMemo(() => {
    return links.filter((link) => visibleNodeSet.has(link.from) || visibleNodeSet.has(link.to));
  }, [links, visibleNodeSet]);

  const debouncedProgressUpdate = useDebouncedCallback((nodeId: string, progress: number) => {
    updateNodeProgress(nodeId, progress);
  }, 120);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={undo}>Undo</Button>
          <Button variant="ghost">Reconnect links</Button>
          <FeatureGate
            feature="roadmap_regeneration"
            title="Roadmap regeneration locked"
            description="Premium subscription is required to regenerate roadmap stages."
          >
            <Button>Regenerate stage</Button>
          </FeatureGate>
          <p className="ml-auto text-xs text-muted">Zoom: {(scale * 100).toFixed(0)}% · Rendered nodes: {visibleNodes.length}/{nodes.length}</p>
        </div>

        <CanvasContainer>
          <motion.div
            className="absolute inset-0"
            onWheel={onWheel}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopPointerAction}
            onPointerLeave={stopPointerAction}
          >
            <div
              className="absolute left-0 top-0 h-[2600px] w-[2000px]"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: '0 0' }}
            >
              <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                {visibleLinks.map((link) => {
                  const from = nodeMap.get(link.from);
                  const to = nodeMap.get(link.to);
                  if (!from || !to) {
                    return null;
                  }

                  return (
                    <line
                      key={`${link.from}-${link.to}`}
                      x1={from.x + 72}
                      y1={from.y + 24}
                      x2={to.x + 72}
                      y2={to.y + 24}
                      stroke="hsl(var(--line))"
                      strokeWidth={1.5}
                    />
                  );
                })}
              </svg>

              {visibleNodes.map((node) => (
                <SkillNode
                  key={node.id}
                  id={node.id}
                  label={node.label}
                  progress={node.progress}
                  x={node.x}
                  y={node.y}
                  selected={selectedNode?.id === node.id}
                  onPointerDown={(nodeId: string, event: PointerEvent<HTMLButtonElement>) =>
                    startNodeDrag(nodeId, event.clientX, event.clientY)
                  }
                  onPointerUp={stopPointerAction}
                  onClick={setSelectedNodeId}
                />
              ))}
            </div>
          </motion.div>
        </CanvasContainer>
      </section>

      <aside className="panel space-y-3">
        <h3 className="text-sm font-semibold text-text">Node Inspector</h3>
        {selectedNode ? (
          <>
            <p className="text-sm text-muted">{selectedNode.label}</p>
            <Input
              label="Progress"
              type="number"
              value={String(selectedNode.progress)}
              onChange={(event) => debouncedProgressUpdate(selectedNode.id, Number(event.target.value))}
            />
            <div className="rounded-lg border border-line bg-bg p-2 text-xs text-muted">
              <p>Conflicting edits: none</p>
              <p>Network disconnect handling: queued update enabled</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Select any skill node to inspect details and apply edits.</p>
        )}
      </aside>
    </div>
  );
}
