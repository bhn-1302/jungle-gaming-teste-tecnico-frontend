export type MockNftUpdatedEvent = {
    resource: 'nft'
    id: string
    version: number
    priceEth: string
    availableQuantity: number
}

export type MockOrderUpdatedEvent = {
    resource: 'order'
    id: string
    version: number
    status: 'pending' | 'confirmed' | 'rejected'
    transactionId: string | null
}

export type MockSocketEventMap = {
    'nft.updated': MockNftUpdatedEvent
    'order.updated': MockOrderUpdatedEvent
}