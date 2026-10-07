import { mockState } from '../data/state'
import { mockSocket } from './client'

export function simulateNftUpdate(
  nftId: string,
  changes: {
    priceEth?: string
    availableQuantity?: number
  },
) {
  const nft = mockState.nfts.find(
    (item) => item.id === nftId,
  )

  if (!nft) {
    throw new Error(`NFT not found: ${nftId}`)
  }

  nft.version += 1

  if (changes.priceEth !== undefined) {
    nft.priceEth = changes.priceEth
  }

  if (changes.availableQuantity !== undefined) {
    nft.availableQuantity = changes.availableQuantity
  }

  mockSocket.emit('mock:nft.update', {
    resource: 'nft',
    id: nft.id,
    version: nft.version,
    priceEth: nft.priceEth,
    availableQuantity: nft.availableQuantity,
  })
}

export function simulateOrderUpdate(
  orderId: string,
  changes: {
    status?: 'pending' | 'confirmed' | 'rejected'
    transactionId?: string | null
  },
) {
  const order = mockState.orders.find(
    (item) => item.id === orderId,
  )

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  order.version += 1

  if (changes.status !== undefined) {
    order.status = changes.status
  }

  if (changes.transactionId !== undefined) {
    order.transactionId = changes.transactionId
  }

  mockSocket.emit('mock:order.update', {
    resource: 'order',
    id: order.id,
    version: order.version,
    status: order.status,
    transactionId: order.transactionId,
  })
}