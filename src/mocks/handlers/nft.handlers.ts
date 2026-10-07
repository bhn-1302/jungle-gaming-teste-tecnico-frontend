import {http, HttpResponse} from 'msw'
import { mockState } from '../data/state'

export const nftHandlers = [
    http.get('/api/nfts', ({ request }) => {
        const url = new URL(request.url)

        const search = url.searchParams.get('search')?.toLowerCase() ?? ''
        const collection = url.searchParams.get('collection') ?? ''
        const sort = url.searchParams.get('sort') ?? 'newest'
        const page = Number(url.searchParams.get('page') ?? '1')
        const limit = Number(url.searchParams.get('limit') ?? '10')

        let filteredNfts = [...mockState.nfts]

        if (search) {
            filteredNfts = filteredNfts.filter((nft) => `${nft.name} ${nft.description} ${nft.creator}`.toLowerCase().includes(search),
        )
        }

        if (collection) {
            filteredNfts = filteredNfts.filter((nft) => nft.collection === collection,)
        }

        filteredNfts.sort((a, b) => {
            switch (sort) {
                case 'price-asc':
                    return Number(a.priceEth) - Number(b.priceEth)
                
                case 'price-desc':
                    return Number(b.priceEth) - Number(a.priceEth)

                case 'name-asc':
                    return a.name.localeCompare(b.name)

                case 'name-desc':
                    return b.name.localeCompare(a.name)

                case 'newest':
                    default:
                        return b.id.localeCompare(a.id)
            }
        })

        const total = filteredNfts.length
        const start = (page - 1) * limit
        const end = start + limit

        return HttpResponse.json({
            items: filteredNfts.slice(start, end),
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        })
    }),

    http.get('/api/nfts/:id', ({params}) => {
        const nft = mockState.nfts.find((item) => item.id === params.id)

        if (!nft) {
            return HttpResponse.json(
                {
                    message: 'NFT not found',
                },
                {
                    status: 404,
                },
            )
        }

        return HttpResponse.json(nft)
    })
]