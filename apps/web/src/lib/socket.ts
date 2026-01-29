// Socket.io client configuration
// Note: For Vercel deployment, true WebSockets require additional setup.
// This module provides a foundation that can be upgraded to use:
// - Socket.io with a custom server
// - Pusher for serverless WebSocket support
// - Server-Sent Events (SSE) as a fallback

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initializeSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';

  if (!socketUrl) {
    console.warn('Socket URL not configured. Real-time features will use polling.');
    // Return a mock socket for development
    return createMockSocket();
  }

  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Socket connected');
    }
  });

  socket.on('disconnect', (reason) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Socket disconnected:', reason);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Event handlers
export function onNewMessage(callback: (message: any) => void): void {
  socket?.on('new_message', callback);
}

export function onMessageRead(callback: (data: { messageId: string; readAt: string }) => void): void {
  socket?.on('message_read', callback);
}

export function onTyping(callback: (data: { conversationId: string; userId: string }) => void): void {
  socket?.on('typing', callback);
}

export function onStopTyping(callback: (data: { conversationId: string; userId: string }) => void): void {
  socket?.on('stop_typing', callback);
}

// Emit events
export function joinConversation(conversationId: string): void {
  socket?.emit('join_conversation', { conversationId });
}

export function leaveConversation(conversationId: string): void {
  socket?.emit('leave_conversation', { conversationId });
}

export function sendTypingIndicator(conversationId: string): void {
  socket?.emit('typing', { conversationId });
}

export function sendStopTypingIndicator(conversationId: string): void {
  socket?.emit('stop_typing', { conversationId });
}

// Mock socket for development without WebSocket server
function createMockSocket(): Socket {
  const handlers: Map<string, Function[]> = new Map();

  return {
    connected: true,
    on: (event: string, handler: Function) => {
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event)!.push(handler);
    },
    off: (event: string, handler?: Function) => {
      if (handler) {
        const eventHandlers = handlers.get(event);
        if (eventHandlers) {
          const index = eventHandlers.indexOf(handler);
          if (index > -1) eventHandlers.splice(index, 1);
        }
      } else {
        handlers.delete(event);
      }
    },
    emit: (event: string, data: unknown) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Mock Socket] Emit: ${event}`, data);
      }
    },
    disconnect: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Mock Socket] Disconnected');
      }
    },
  } as unknown as Socket;
}

// Polling fallback for environments without WebSocket support
export class MessagePoller {
  private intervalId: NodeJS.Timeout | null = null;
  private conversationId: string;
  private lastMessageId: string | null = null;
  private onNewMessage: (messages: any[]) => void;

  constructor(conversationId: string, onNewMessage: (messages: any[]) => void) {
    this.conversationId = conversationId;
    this.onNewMessage = onNewMessage;
  }

  start(intervalMs: number = 3000): void {
    this.poll(); // Initial poll
    this.intervalId = setInterval(() => this.poll(), intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async poll(): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (this.lastMessageId) {
        params.set('after', this.lastMessageId);
      }

      const response = await fetch(
        `/api/conversations/${this.conversationId}/messages?${params}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const messages = await response.json();
        if (messages.length > 0) {
          this.lastMessageId = messages[messages.length - 1].id;
          this.onNewMessage(messages);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  setLastMessageId(id: string): void {
    this.lastMessageId = id;
  }
}
