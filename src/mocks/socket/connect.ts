import { mockSocket } from "./client";

export function connectMockSocket() {
    if (mockSocket.connected) {
        return
    }

    mockSocket.connect()
}

export function disconnectMockSocket() {
    if (!mockSocket.connected) {
        return
    }

    mockSocket.disconnect()
}

