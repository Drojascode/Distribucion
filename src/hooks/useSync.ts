import { useEffect, useRef, useState, useCallback } from 'react';
import type { Asignaciones, Nicknames, Avatares } from '../types';

export interface SyncState {
  asignaciones: Asignaciones;
  listaEspera: string[];
  alias: Nicknames;
  iconos: Avatares;
  filas: number;
}

export function useSync(
  onRemoteState: (state: SyncState) => void,
): { connected: boolean; push: (state: SyncState) => void } {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onRemoteRef = useRef(onRemoteState);
  onRemoteRef.current = onRemoteState;

  useEffect(() => {
    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let pingInterval: ReturnType<typeof setInterval>;

    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let ws: WebSocket;
      try {
        ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      } catch {
        return; // invalid env (e.g. file://)
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        // Keepalive: Azure App Service closes idle WS after ~240 s
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 120_000);
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        setConnected(false);
        wsRef.current = null;
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {}; // handled by onclose; silent in local dev

      ws.onmessage = (e: MessageEvent) => {
        try {
          const msg = JSON.parse(e.data as string) as { type: string; payload: SyncState };
          if (msg.type === 'state') {
            onRemoteRef.current(msg.payload);
          }
        } catch {}
      };
    }

    connect();

    return () => {
      closed = true;
      clearTimeout(reconnectTimer);
      clearInterval(pingInterval);
      wsRef.current?.close();
    };
  }, []);

  const push = useCallback((state: SyncState) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'update', payload: state }));
    }
  }, []);

  return { connected, push };
}
