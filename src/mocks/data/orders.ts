export type MockOrderStatus = 
    | 'pending'
    | 'confirmed'
    | 'rejected'

export type MockOrderItem = {
    nftId : string
    name: string
    quantity: number
    unitPriceEth: string
}

export type MockOrder = {
    id: string
    userId: string
    status: MockOrderStatus
    items: MockOrderItem[]
    subtotalEth: string
    discountEth: string
    networkFeeEth: string
    totalEth: string
    transactionId: string | null
    idempotencyKey: string
    version: number
}

export const orders: MockOrder[] = []