import { useState } from 'react'

import { useWallets } from '../api/queries/use-wallets'

export function WalletsPage() {
  const wallets = useWallets()

  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState('ethereum')
  const [label, setLabel] = useState('')

  if (wallets.isPending) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-semibold">
          Wallets
        </h1>

        <p className="mt-6">Loading wallets...</p>
      </main>
    )
  }

  if (wallets.isError) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-semibold">
          Wallets
        </h1>

        <p className="mt-6 text-red-600">
          Unable to load your wallets.
        </p>
      </main>
    )
  }

  const walletItems = wallets.data ?? []

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    await wallets.createWallet({
      address,
      network,
      label,
    })

    setAddress('')
    setLabel('')
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-gray-500">
          NFT Marketplace
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Wallets
        </h1>

        <p className="mt-2 text-gray-500">
          Manage the wallets available for your
          purchases.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="text-xl font-semibold">
            Your wallets
          </h2>

          {walletItems.length === 0 ? (
            <div className="mt-6 rounded-xl border p-6">
              <p className="text-gray-500">
                You don't have any wallets yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {walletItems.map((wallet) => (
                <article
                  key={wallet.id}
                  className="rounded-xl border p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {wallet.label}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {wallet.network}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        wallets.removeWallet(wallet.id)
                      }
                      disabled={wallets.isRemoving}
                      className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {wallets.isRemoving
                        ? 'Removing...'
                        : 'Remove'}
                    </button>
                  </div>

                  <p className="mt-4 break-all rounded-lg border p-3 font-mono text-sm">
                    {wallet.address}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="h-fit rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Add wallet
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="wallet-label"
                className="text-sm font-medium"
              >
                Label
              </label>

              <input
                id="wallet-label"
                name="label"
                type="text"
                value={label}
                onChange={(event) =>
                  setLabel(event.target.value)
                }
                placeholder="Main Wallet"
                required
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="wallet-address"
                className="text-sm font-medium"
              >
                Wallet address
              </label>

              <input
                id="wallet-address"
                name="address"
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="0x..."
                required
                className="w-full rounded-lg border px-3 py-2 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="wallet-network"
                className="text-sm font-medium"
              >
                Network
              </label>

              <select
                id="wallet-network"
                name="network"
                value={network}
                onChange={(event) =>
                  setNetwork(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="ethereum">
                  Ethereum
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={wallets.isCreating}
              className="w-full rounded-lg border px-6 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {wallets.isCreating
                ? 'Adding...'
                : 'Add wallet'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}