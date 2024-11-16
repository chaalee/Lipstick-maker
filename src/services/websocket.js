// src/services/websocket.js
class WebSocketService {
  constructor() {
      this.ws = null;
      this.callbacks = new Map();
  }

  connect() {
      this.ws = new WebSocket('ws://localhost:8000/ws');
      
      this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (this.callbacks.has('status')) {
              this.callbacks.get('status')(data.status);
          }
      };

      return new Promise((resolve, reject) => {
          this.ws.onopen = () => resolve();
          this.ws.onerror = (error) => reject(error);
      });
  }

  onStatus(callback) {
      this.callbacks.set('status', callback);
  }

  moveConveyor() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ action: 'move_conveyor' }));
      }
  }

  returnHome() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ action: 'home' }));
      }
  }

  disconnect() {
      if (this.ws) {
          this.ws.close();
      }
  }
}

export const wsService = new WebSocketService();
