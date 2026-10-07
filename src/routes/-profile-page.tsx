import { useState } from 'react'

import { useProfile } from '../api/queries/use-profile'

export function ProfilePage() {
  const profile = useProfile()

  if (profile.isPending) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold">
          Profile
        </h1>

        <p className="mt-6">Loading profile...</p>
      </main>
    )
  }

  if (profile.isError) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold">
          Profile
        </h1>

        <p className="mt-6 text-red-600">
          Unable to load your profile.
        </p>
      </main>
    )
  }

  if (!profile.data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold">
          Profile
        </h1>

        <p className="mt-6 text-gray-500">
          Profile not available.
        </p>
      </main>
    )
  }

  return (
    <ProfileForm
      initialDisplayName={profile.data.displayName}
      initialBio={profile.data.bio}
      isUpdating={profile.isUpdating}
      onUpdate={profile.updateProfile}
    />
  )
}

type ProfileFormProps = {
  initialDisplayName: string
  initialBio: string
  isUpdating: boolean
  onUpdate: (data: {
    displayName: string
    bio: string
  }) => Promise<unknown>
}

function ProfileForm({
  initialDisplayName,
  initialBio,
  isUpdating,
  onUpdate,
}: ProfileFormProps) {
  const [displayName, setDisplayName] =
    useState(initialDisplayName)

  const [bio, setBio] = useState(initialBio)

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    await onUpdate({
      displayName,
      bio,
    })
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-gray-500">
          NFT Marketplace
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your collector profile.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border p-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="display-name"
            className="text-sm font-medium"
          >
            Display name
          </label>

          <input
            id="display-name"
            name="displayName"
            type="text"
            value={displayName}
            onChange={(event) =>
              setDisplayName(event.target.value)
            }
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="bio"
            className="text-sm font-medium"
          >
            Bio
          </label>

          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(event) =>
              setBio(event.target.value)
            }
            rows={5}
            className="w-full resize-y rounded-lg border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="rounded-lg border px-6 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </main>
  )
}