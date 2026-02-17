'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type UseAIStreamOptions = {
  endpoint?: string;
  onToken?: (token: string) => void;
};

export function useAIStream(options: UseAIStreamOptions = {}) {
  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const onTokenRef = useRef(options.onToken);

  const endpoint = options.endpoint ?? process.env.NEXT_PUBLIC_AI_WS_URL ?? 'ws://localhost:8083/ws';

  useEffect(() => {
    onTokenRef.current = options.onToken;
  }, [options.onToken]);

  const connect = useCallback(() => {
    if (socketRef.current) {
      return;
    }

    const socket = new WebSocket(endpoint);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onclose = () => {
      setConnected(false);
      socketRef.current = null;
      reconnectTimerRef.current = window.setTimeout(() => {
        connect();
      }, 1600);
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        onTokenRef.current?.(event.data);
      }
    };
  }, [endpoint]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connect]);

  const streamPrompt = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) {
        return;
      }

      setStreaming(true);

      if (socketRef.current && connected) {
        socketRef.current.send(JSON.stringify({ type: 'prompt', prompt }));
        return;
      }

      const fallback = `AI could not establish WebSocket connection. Local fallback summary for: ${prompt}`;
      const parts = fallback.split(' ');

      for (const part of parts) {
        await new Promise((resolve) => window.setTimeout(resolve, 70));
        onTokenRef.current?.(`${part} `);
      }

      setStreaming(false);
    },
    [connected, options]
  );

  const stop = useCallback(() => {
    setStreaming(false);
  }, []);

  return {
    connected,
    streaming,
    streamPrompt,
    stop,
    setStreaming
  };
}
