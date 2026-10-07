import { authHandlers } from './auth.handlers'
import { cartHandlers } from './cart.handlers'
import { favoritesHandlers } from './favorite.handlers'
import { nftHandlers } from './nft.handlers'
import { orderHandlers } from './order.handlers'
import { profileHandlers } from './profile.handlers'
import { quoteHandlers } from './quote.handlers'
import { walletHandlers } from './wallet.handlers'

export const handlers = [
  ...authHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...nftHandlers,
  ...orderHandlers,
  ...quoteHandlers,
  ...profileHandlers,
  ...walletHandlers,
]