import {
  connectSocket,
  disconnectSocket,
  subscribeToSocketEvents,
} from './socketService'

type RealtimeManagerOptions = {
  onNftUpdated?: Parameters<
    typeof subscribeToSocketEvents
  >[0]['onNftUpdated']
  onOrderUpdated?: Parameters<
    typeof subscribeToSocketEvents
  >[0]['onOrderUpdated']
  onReconnect?: () => void
}

let unsubscribe: (() => void) | null = null

export function startRealtime(
  options: RealtimeManagerOptions,
) {
  if (unsubscribe) return

  unsubscribe = subscribeToSocketEvents({
    onNftUpdated: options.onNftUpdated,
    onOrderUpdated: options.onOrderUpdated,
    onReconnect: options.onReconnect,
  })

  connectSocket()
}

export function stopRealtime() {
  if (!unsubscribe) return

  unsubscribe()
  unsubscribe = null
  disconnectSocket()
}