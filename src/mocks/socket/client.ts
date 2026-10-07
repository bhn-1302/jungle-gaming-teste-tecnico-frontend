import { io } from "socket.io-client";

export const mockSocket = io('htpp://localhost:3001', {
    autoConnect: false,
    transports: ['websocket'],
})

mockSocket.on('connect', () => {
    console.log(
        `[Mock Socket.IO] Client connected: ${mockSocket.id}`,
    )
})

mockSocket.on('disconnect', (reason) => {
    console.log(
        `[Mock Socket.IO] Client disconnected: ${reason}`,
    )
})

mockSocket.on('connect_error', (error) => {
    console.error(
        '[Mock Socket.IO] Connection error:',
        error.message, 
    )
})