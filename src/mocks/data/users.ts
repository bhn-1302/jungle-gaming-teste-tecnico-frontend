export type MockUser = {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    avatarUrl: string | null
}

export const users: MockUser[] = [
    {
        id: 'user-1',
        name: 'Alice Martins',
        email: 'alice@example.com',
        passwordHash: 'mock-hash-alice',
        avatarUrl: null,
    },
    {
       id: 'user-2',
        name: 'Bruno Almeida',
        email: 'bruno@example.com',
        passwordHash: 'mock-hash-bruno',
        avatarUrl: null, 
    },
]