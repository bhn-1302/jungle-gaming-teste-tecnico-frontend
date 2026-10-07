import { Outlet } from '@tanstack/react-router'

import { Header } from '../components/layout/header'

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <Header />

      <Outlet />
    </div>
  )
}