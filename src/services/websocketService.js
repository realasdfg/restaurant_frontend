class WebSocketService {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.listeners = new Set();
    }

    connect() {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => console.log("WebSocket connected:", this.url);
            this.ws.onclose = () => console.log("WebSocket disconnected:", this.url);

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.listeners.forEach((callback) => callback(data));
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };
        }
    }

    connectToOrder(orderId) {
        return new WebSocketService(`${this.url}/${orderId}`);
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

export const orderWebSocketService = new WebSocketService("ws://localhost:8000/ws/orders");
export const tableWebSocketService = new WebSocketService("ws://localhost:8000/ws/tables");
