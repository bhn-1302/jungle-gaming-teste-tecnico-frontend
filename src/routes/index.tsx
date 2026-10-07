import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  validateSearch: (
    search: Record<string, unknown>,
  ) => ({
    search:
      typeof search.search === 'string'
        ? search.search
        : undefined,

    collection:
      typeof search.collection === 'string'
        ? search.collection
        : undefined,

    sort:
      typeof search.sort === 'string'
        ? search.sort
        : 'newest',

    page:
      typeof search.page === 'number' &&
      Number.isInteger(search.page) &&
      search.page >= 1
        ? search.page
        : 1,

    limit:
      typeof search.limit === 'number' &&
      Number.isInteger(search.limit) &&
      search.limit >= 1
        ? search.limit
        : 10,
  }),
})