/**
 * Socket Manager - Client-side Socket.io connection handler
 */

import { io } from 'socket.io-client';
import { GAME_CONFIG } from '../config/GameConfig';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.listeners = new Map();
  }

  connect(serverUrl = '') {
    if (this.socket) {
      return Promise.resolve(this.socket);
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl || window.location.origin, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000
        });

        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket.id);
          this.isConnected = true;
          resolve(this.socket);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        // Handle reconnection
        this.socket.on('reconnect', (attemptNumber) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
          this.isConnected = true;
          
          // Re-authenticate if we have userId
          if (this.userId) {
            this.authenticate(this.userId, this.displayName);
          }
        });

      } catch (error) {
        console.error('Failed to create socket:', error);
        reject(error);
      }
    });
  }

  authenticate(userId, displayName = 'Player') {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot authenticate: not connected');
      return Promise.reject(new Error('Not connected'));
    }

    this.userId = userId;
    this.displayName = displayName;

    return new Promise((resolve) => {
      this.socket.emit('authenticate', { userId, displayName });
      
      this.socket.once('authenticated', (data) => {
        console.log('Authenticated:', data);
        resolve(data);
      });
    });
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Track listeners for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit: not connected');
    }
  }

  sendGameEvent(type, payload) {
    this.emit('gameEvent', { type, payload });
  }

  subscribeLeaderboard(callback) {
    this.on('leaderboardUpdate', callback);
    this.emit('subscribeLeaderboard');
  }

  sendChatMessage(message) {
    this.emit('chatMessage', { message });
  }

  disconnect() {
    if (this.socket) {
      // Remove all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(cb => this.socket.off(event, cb));
      });
      this.listeners.clear();
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Singleton instance
export const socketManager = new SocketManager();
export default socketManager;
