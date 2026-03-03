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
  const isFirstAttempt = useRef(true);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let unmounted = false;

    function connect() {
      if (unmounted) return;
      
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          retryCountRef.current = 0;
          isFirstAttempt.current = false;
          console.log('[WS] Connected to AetherOS backend');
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

        ws.onclose = (event) => {
          if (unmounted) return;
          if (retryCountRef.current < MAX_RETRIES) {
            const delay = BASE_DELAY * Math.pow(1.5, retryCountRef.current);
            retryCountRef.current++;
            // Only log if not a normal close
            if (!event.wasClean) {
              console.log(`[WS] Disconnected — retrying in ${Math.round(delay / 1000)}s (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
            }
            retryTimerRef.current = setTimeout(connect, delay);
          } else {
            console.warn('[WS] Max retries reached. WebSocket offline.');
          }
        };

        ws.onerror = (error) => {
          // Only close if connection is still opening or open
          if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
          // Provide helpful message on first connection attempt
          if (isFirstAttempt.current && retryCountRef.current === 0) {
            console.warn('[WS] Cannot connect to backend server. Make sure to run: npm run dev');
            isFirstAttempt.current = false;
          }
        };
      } catch (error) {
        // Handle WebSocket constructor errors
        console.error('[WS] Failed to create WebSocket:', error.message);
        if (retryCountRef.current < MAX_RETRIES && !unmounted) {
          const delay = BASE_DELAY * Math.pow(1.5, retryCountRef.current);
          retryCountRef.current++;
          retryTimerRef.current = setTimeout(connect, delay);
        }
      }
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
