/**
 * AetherOS — WebSocket Client Hook
 * Reconnects with exponential backoff, cleans up properly.
 */
import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

const MAX_RETRIES = 10;
const BASE_DELAY = 2000;

export default function useWebSocket() {
  const wsRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let unmounted = false;

    function connect() {
      if (unmounted) return;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        retryCountRef.current = 0;
        console.log('[WS] Connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const store = useStore.getState();
          switch (data.type) {
            case 'environment-updated':
              store.setNotification('Environment updated remotely');
              break;
            case 'rule-validation':
              store.setNotification(`Validation: ${data.payload?.violationCount ?? 0} violation(s)`);
              break;
            case 'simulation-started':
              store.setNotification('Simulation started remotely');
              break;
            case 'simulation-ended':
              store.setNotification('Simulation ended');
              break;
            default:
              break;
          }
        } catch { /* ignore malformed messages */ }
      };

      ws.onclose = () => {
        if (unmounted) return;
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(1.5, retryCountRef.current);
          retryCountRef.current++;
          console.log(`[WS] Disconnected — retrying in ${Math.round(delay / 1000)}s (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
          retryTimerRef.current = setTimeout(connect, delay);
        } else {
          console.warn('[WS] Max retries reached. WebSocket offline.');
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      unmounted = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return wsRef;
}
