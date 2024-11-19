// src/services/websocket.js
class WebSocketService {
    constructor() {
        this.ws = null;
        this.callbacks = new Map();
    }

    connect() {
        this.ws = new WebSocket('ws://localhost:8000/ws');
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket received:', data);  // Debug log

                if (data.status && this.callbacks.has('status')) {
                    this.callbacks.get('status')(data.status);
                }
                if (data.error && this.callbacks.has('error')) {
                    this.callbacks.get('error')(data.error);
                    console.error('WebSocket error:', data.error);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        return new Promise((resolve, reject) => {
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                resolve();
            };
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };
        });
    }

    onStatus(callback) {
        this.callbacks.set('status', callback);
    }

    onError(callback) {
        this.callbacks.set('error', callback);
    }

    moveConveyor(lipstickName) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            const message = {
                action: 'move_conveyor',
                lipstick: lipstickName
            };
            console.log('Sending to server:', message);  // Debug log
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket not connected');
        }
    }

    returnHome() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('Sending home command to server');  // Debug print
            this.ws.send(JSON.stringify({ action: 'home' }));
        } else {
            console.error('WebSocket not connected when trying to return home');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

export const wsService = new WebSocketService();