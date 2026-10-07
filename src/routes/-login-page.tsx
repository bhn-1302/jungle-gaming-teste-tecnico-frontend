import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'

import { useSession } from '../api/queries/use-session'

export function LoginPage() {
  const navigate = useNavigate()
  const session = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    await session.login({
      email,
      password,
    })

    await navigate({
      to: '/',
    })
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-10">
      <section className="w-full">
        <div className="mb-8">
          <p className="text-sm text-gray-500">
            NFT Marketplace
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Login
          </h1>

          <p className="mt-2 text-gray-500">
            Sign in to access your collector account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border p-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          {session.isError && (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              Unable to sign in. Check your email and
              password.
            </p>
          )}

          <button
            type="submit"
            disabled={session.isLoggingIn}
            className="w-full rounded-lg border px-4 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {session.isLoggingIn
              ? 'Signing in...'
              : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-gray-900 underline"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  )
}