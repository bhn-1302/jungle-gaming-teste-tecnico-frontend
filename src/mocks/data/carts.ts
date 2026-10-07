export type MockCartItem = {
  userId: string
  nftId: string
  quantity: number
}

const storageKey = 'mock-cart'

function readCartItems(): MockCartItem[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  const stored = localStorage.getItem(storageKey)

  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

function writeCartItems(items: MockCartItem[]) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(storageKey, JSON.stringify(items))
}

export const cartItems: MockCartItem[] = readCartItems()

export function persistCartItems() {
  writeCartItems(cartItems)
}