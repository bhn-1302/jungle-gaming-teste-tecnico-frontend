import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'

import './index.css'
import { queryClient } from './lib/query-client'
import { routeTree } from './routeTree.gen'
import { RealtimeProvider } from './components/realtime-provider'

const router = createRouter({
  routeTree,
})

async function enableMocking() {
  if (!import.meta.env.VITE_ENABLE_MOCKS) {
    return
  }

  const { worker } = await import('./mocks/browser')

  return worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <RouterProvider router={router} />
      </RealtimeProvider>
    </QueryClientProvider>
  </StrictMode>,
  )
})