/**
 * WebSocket broadcast utility
 */
function broadcastEvent(clients, event) {
  if (!clients || clients.size === 0) return;
  const message = JSON.stringify(event);
  for (const client of clients) {
    try {
      if (client.readyState === 1) {
        client.send(message);
      }
    } catch (err) {
      console.warn('[WS] Failed to send to client:', err.message);
    }
  }
}

module.exports = { broadcastEvent };
