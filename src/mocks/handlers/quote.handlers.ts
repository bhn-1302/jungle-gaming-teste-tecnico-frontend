import { http, HttpResponse } from "msw";

import { mockState } from "../data/state";

import { addEth, multiplyEth, percentageEth, subtractEth } from "../utils/eth";

function getUserId(request: Request): string | null {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return null;
  }

  const token = authorization.replace("Bearer ", "");

  const user = mockState.users.find(
    (item) => token === `mock-token-${item.id}`,
  );

  return user?.id ?? null;
}

export const quoteHandlers = [
  http.post("/api/quote", async ({ request }) => {
    const userId = getUserId(request);

    if (!userId) {
      return HttpResponse.json(
        { message: "Session required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      items?: unknown;
      coupon?: unknown;
    };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return HttpResponse.json(
        {
          message: "Quote requires at least one item",
        },
        { status: 400 },
      );
    }

    if (body.coupon !== undefined && typeof body.coupon !== "string") {
      return HttpResponse.json(
        {
          message: "Invalid coupon",
        },
        { status: 400 },
      );
    }

    const coupon = body.coupon?.trim();

    if (coupon === "EXPIRED10") {
      return HttpResponse.json(
        {
          message: "Coupon expired",
          code: "COUPON_EXPIRED",
        },
        { status: 410 },
      );
    }

    if (coupon && coupon !== "WELCOME10") {
      return HttpResponse.json(
        {
          message: "Invalid coupon",
          code: "COUPON_INVALID",
        },
        { status: 400 },
      );
    }

    const items: {
      nftId: string;
      quantity: number;
      unitPriceEth: string;
    }[] = [];

    for (const item of body.items) {
      if (
        typeof item !== "object" ||
        item === null ||
        !("nftId" in item) ||
        !("quantity" in item) ||
        typeof item.nftId !== "string" ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return HttpResponse.json(
          {
            message: "Invalid quote item",
          },
          { status: 400 },
        );
      }

      const nft = mockState.nfts.find(
        (candidate) => candidate.id === item.nftId,
      );

      if (!nft) {
        return HttpResponse.json(
          {
            message: "NFT not found",
            nftId: item.nftId,
          },
          { status: 404 },
        );
      }

      if (item.quantity > nft.availableQuantity) {
        return HttpResponse.json(
          {
            message: "NFT unavailable",
            nftId: nft.id,
            availableQuantity: nft.availableQuantity,
          },
          { status: 409 },
        );
      }

      items.push({
        nftId: nft.id,
        quantity: item.quantity,
        unitPriceEth: nft.priceEth,
      });
    }

    const subtotal = items.reduce(
      (total, item) =>
        addEth(total, multiplyEth(item.unitPriceEth, item.quantity)),
      "0.00000000",
    );

    let discount = "0.00000000";

    if (coupon === "WELCOME10") {
      discount = percentageEth(subtotal, 10n);
    }

    const networkFee = "0.05000000";

    const total = addEth(subtractEth(subtotal, discount), networkFee);

    const quote = {
      id: `quote-${mockState.quotes.length + 1}`,
      userId,
      items,
      coupon,
      subtotalEth: subtotal,
      discountEth: discount,
      networkFeeEth: networkFee,
      totalEth: total,
      version: 1,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    mockState.quotes.push(quote);

    return HttpResponse.json(quote);
  }),
];
