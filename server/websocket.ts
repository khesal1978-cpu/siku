import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<ClientConnection>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      let currentUserId: string | null = null;

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'auth' && data.userId) {
            const userId: string = data.userId;
            currentUserId = userId;
            if (!this.clients.has(userId)) {
              this.clients.set(userId, new Set());
            }
            const userClients = this.clients.get(userId);
            if (userClients) {
              userClients.add({ ws, userId });
            }
            
            ws.send(JSON.stringify({ type: 'auth_success', userId }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        if (currentUserId) {
          const userClients = this.clients.get(currentUserId);
          if (userClients) {
            userClients.forEach(client => {
              if (client.ws === ws) {
                userClients.delete(client);
              }
            });
            if (userClients.size === 0) {
              this.clients.delete(currentUserId);
            }
          }
        }
      });
    });
  }

  broadcast(userId: string, event: string, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify({ type: event, data });
      userClients.forEach(({ ws }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  broadcastToAll(event: string, data: any) {
    const message = JSON.stringify({ type: event, data });
    this.wss?.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}

export const wsManager = new WebSocketManager();
