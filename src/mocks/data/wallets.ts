export type MockWallet = {
  id: string
  userId: string
  address: string
  network: string
  label: string
}

export const wallets: MockWallet[] = [
  {
    id: 'wallet-1',
    userId: 'user-1',
    address: '0xAliceMockWallet001',
    network: 'ethereum',
    label: 'Main Wallet',
  },
  {
    id: 'wallet-2',
    userId: 'user-2',
    address: '0xBrunoMockWallet002',
    network: 'ethereum',
    label: 'Main Wallet',
  },
]