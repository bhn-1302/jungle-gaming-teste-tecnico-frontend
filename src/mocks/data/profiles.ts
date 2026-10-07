export type MockProfile = {
    userId: string;
    displayName: string
    bio: string
}

export const profiles: MockProfile[] = [
    {
        userId: 'user-1',
        displayName: 'Alice Martins',
        bio: 'Digital art collector',
    },
    {
        userId: 'user-2',
        displayName: 'Bruno Almeida',
        bio: 'NFT enthusiast.',
    },
]