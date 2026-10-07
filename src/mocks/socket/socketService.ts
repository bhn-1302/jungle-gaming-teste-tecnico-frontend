import { mockSocket } from './client'
import type {
  MockNftUpdatedEvent,
  MockOrderUpdatedEvent,
} from './events'

type SocketEventHandlers = {
  onNftUpdated?: (event: MockNftUpdatedEvent) => void
  onOrderUpdated?: (event: MockOrderUpdatedEvent) => void
  onReconnect?: () => void
}

const nftVersions = new Map<string, number>()
const orderVersions = new Map<string, number>()

function isNewerVersion(
  versions: Map<string, number>,
  id: string,
  version: number,
) {
  const currentVersion = versions.get(id) ?? 0

  if (version <= currentVersion) {
    return false
  }

  versions.set(id, version)

  return true
}

export function connectSocket() {
  if (!mockSocket.connected) {
    mockSocket.connect()
  }
}

export function disconnectSocket() {
  if (mockSocket.connected) {
    mockSocket.disconnect()
  }
}

export function subscribeToSocketEvents(
  handlers: SocketEventHandlers,
) {
  const handleNftUpdated = (event: MockNftUpdatedEvent) => {
    if (
      !isNewerVersion(
        nftVersions,
        event.id,
        event.version,
      )
    ) {
      return
    }

    handlers.onNftUpdated?.(event)
  }

  const handleOrderUpdated = (
    event: MockOrderUpdatedEvent,
  ) => {
    if (
      !isNewerVersion(
        orderVersions,
        event.id,
        event.version,
      )
    ) {
      return
    }

    handlers.onOrderUpdated?.(event)
  }

  const handleReconnect = () => {
    handlers.onReconnect?.()
  }

  mockSocket.on('nft.updated', handleNftUpdated)
  mockSocket.on('order.updated', handleOrderUpdated)
  mockSocket.on('connect', handleReconnect)

  return () => {
    mockSocket.off('nft.updated', handleNftUpdated)
    mockSocket.off('order.updated', handleOrderUpdated)
    mockSocket.off('connect', handleReconnect)
  }
}

export function resetSocketVersions() {
  nftVersions.clear()
  orderVersions.clear()
}