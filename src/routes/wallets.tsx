import { createFileRoute } from '@tanstack/react-router'

import { WalletsPage } from './-wallets-page'

export const Route = createFileRoute('/wallets')({
  component: WalletsPage,
})
