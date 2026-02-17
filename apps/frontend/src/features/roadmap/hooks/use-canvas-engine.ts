'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export type CanvasNode = {
  id: string;
  label: string;
  progress: number;
  x: number;
  y: number;
};

type HistoryState = {
  nodes: CanvasNode[];
};

export function useCanvasEngine(initialNodes: CanvasNode[]) {
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const historyRef = useRef<HistoryState[]>([]);
  const draggingRef = useRef<{ nodeId: string; lastX: number; lastY: number } | null>(null);
  const panningRef = useRef<{ x: number; y: number } | null>(null);

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);

  const pushHistory = useCallback((nextNodes: CanvasNode[]) => {
    historyRef.current = [...historyRef.current.slice(-19), { nodes: nextNodes }];
  }, []);

  const undo = useCallback(() => {
    const previous = historyRef.current.at(-1);
    if (!previous) {
      return;
    }

    historyRef.current = historyRef.current.slice(0, -1);
    setNodes(previous.nodes);
  }, []);

  const updateNodeProgress = useCallback(
    (nodeId: string, progress: number) => {
      pushHistory(nodes);
      setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, progress } : node)));
    },
    [nodes, pushHistory]
  );

  const startNodeDrag = useCallback((nodeId: string, clientX: number, clientY: number) => {
    draggingRef.current = { nodeId, lastX: clientX, lastY: clientY };
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (draggingRef.current) {
        const { nodeId, lastX, lastY } = draggingRef.current;
        const dx = (event.clientX - lastX) / scale;
        const dy = (event.clientY - lastY) / scale;

        setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, x: node.x + dx, y: node.y + dy } : node)));
        draggingRef.current = { nodeId, lastX: event.clientX, lastY: event.clientY };
      } else if (panningRef.current) {
        const dx = event.clientX - panningRef.current.x;
        const dy = event.clientY - panningRef.current.y;
        setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        panningRef.current = { x: event.clientX, y: event.clientY };
      }
    },
    [scale]
  );

  const stopPointerAction = useCallback(() => {
    draggingRef.current = null;
    panningRef.current = null;
  }, []);

  const onCanvasPointerDown = useCallback((event: React.PointerEvent) => {
    if (event.button === 1 || event.shiftKey) {
      panningRef.current = { x: event.clientX, y: event.clientY };
    }
  }, []);

  const onWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const next = Math.min(2.2, Math.max(0.5, scale - event.deltaY * 0.001));
    setScale(next);
  }, [scale]);

  return {
    nodes,
    scale,
    offset,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeProgress,
    onWheel,
    onPointerMove,
    onCanvasPointerDown,
    stopPointerAction,
    startNodeDrag,
    undo
  };
}
