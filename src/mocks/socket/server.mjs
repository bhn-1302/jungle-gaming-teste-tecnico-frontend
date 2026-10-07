import { Server } from 'socket.io'
import { mockState } from '../data/state.ts'

const PORT = 3001

const io = new Server(PORT, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

function applyOrderUpdate(event) {
  const order = mockState.orders.find(
    (item) => item.id === event.id,
  )

  if (!order) {
    return
  }

  const wasAlreadyConfirmed =
    order.status === 'confirmed'

  order.status = event.status
  order.transactionId = event.transactionId
  order.version = event.version

  if (
    event.status !== 'confirmed' ||
    wasAlreadyConfirmed
  ) {
    return
  }

  for (const orderItem of order.items) {
    const cartItem = mockState.cartItems.find(
      (item) =>
        item.userId === order.userId &&
        item.nftId === orderItem.nftId,
    )

    if (!cartItem) {
      continue
    }

    const remainingQuantity =
      cartItem.quantity - orderItem.quantity

    if (remainingQuantity <= 0) {
      const index =
        mockState.cartItems.indexOf(cartItem)

      mockState.cartItems.splice(index, 1)
    } else {
      cartItem.quantity = remainingQuantity
    }
  }
}

io.on('connection', (socket) => {
  console.log(
    `[Mock Socket.IO] Client connected: ${socket.id}`,
  )

  socket.on('mock:nft.update', (event) => {
    io.emit('nft.updated', event)
  })

  socket.on('mock:order.update', (event) => {
    applyOrderUpdate(event)
    io.emit('order.updated', event)
  })

  socket.on('disconnect', (reason) => {
    console.log(
      `[Mock Socket.IO] Client disconnected: ${socket.id} (${reason})`,
    )
  })
})

export function emitNftUpdated(event) {
  io.emit('nft.updated', event)
}

export function emitOrderUpdated(event) {
  applyOrderUpdate(event)
  io.emit('order.updated', event)
}

console.log(
  `[Mock Socket.IO] Server running on http://localhost:${PORT}`,
)