export type MockFavorites = {
  userId: string
  nftId: string
}

const storageKey = 'mock-favorites'

function readFavorites(): MockFavorites[] {
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

function writeFavorites(items: MockFavorites[]) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(storageKey, JSON.stringify(items))
}

export const favorites: MockFavorites[] = readFavorites()

export function getStoredFavorites() {
  return readFavorites()
}

export function addStoredFavorite(favorite: MockFavorites) {
  const current = readFavorites()

  const alreadyExists = current.some(
    (item) =>
      item.userId === favorite.userId &&
      item.nftId === favorite.nftId,
  )

  if (!alreadyExists) {
    current.push(favorite)
    writeFavorites(current)
  }

  return current
}

export function removeStoredFavorite(
  userId: string,
  nftId: string,
) {
  const current = readFavorites()

  const filtered = current.filter(
    (item) =>
      !(
        item.userId === userId &&
        item.nftId === nftId
      ),
  )

  writeFavorites(filtered)

  return filtered
}