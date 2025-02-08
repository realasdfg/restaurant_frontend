class WebSocketService {
    constructor(url) {
        this.baseUrl = url;
        this.ws = null;
        this.listeners = new Set();
    }

    connect(token) {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            const urlWithToken = `${this.baseUrl}?token=${encodeURIComponent(token)}`;
            this.ws = new WebSocket(urlWithToken);

            this.ws.onopen = () => console.log("WebSocket connected:", this.baseUrl);
            this.ws.onclose = () => console.log("WebSocket disconnected:", this.baseUrl);

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

    connectToOrder(orderId, token) {
        const orderService = new WebSocketService(`${this.baseUrl}/${orderId}`);
        orderService.connect(token);
        return orderService;
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
