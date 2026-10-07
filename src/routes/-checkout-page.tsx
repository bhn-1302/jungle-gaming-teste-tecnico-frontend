import { useState } from "react";

import { Link, useNavigate } from "@tanstack/react-router";

import { useCart } from "../api/queries/use-cart";
import { useQuote } from "../api/queries/use-quote";
import { useWallets } from "../api/queries/use-wallets";
import { createOrder } from "../api/services/order.service";
import { startRealtime, stopRealtime } from "../mocks/socket/realtimeManager";

type WalletConnectionStatus =
  "disconnected" | "connecting" | "connected" | "declined";

type OrderStatus = "idle" | "pending" | "confirmed" | "rejected";

export function CheckoutPage() {
  const navigate = useNavigate();

  const cart = useCart();
  const quote = useQuote();
  const wallets = useWallets();

  const [collectorName, setCollectorName] = useState("");
  const [collectorEmail, setCollectorEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [network, setNetwork] = useState("ethereum");
  const [showReview, setShowReview] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [walletStatus, setWalletStatus] =
    useState<WalletConnectionStatus>("disconnected");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [orderId, setOrderId] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  if (cart.isPending || wallets.isPending) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Checkout</h1>

        <p className="mt-6">Loading checkout...</p>
      </main>
    );
  }

  if (cart.isError || wallets.isError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Checkout</h1>

        <p className="mt-6 text-red-600">
          Unable to load your checkout information.
        </p>
      </main>
    );
  }

  const items = cart.data ?? [];
  const walletItems = wallets.data ?? [];

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Checkout</h1>

        <div className="mt-10">
          <p className="text-gray-500">Your cart is empty.</p>

          <Link
            to="/cart"
            className="mt-6 inline-block rounded-lg border px-5 py-3 font-medium"
          >
            Back to cart
          </Link>
        </div>
      </main>
    );
  }

  const selectedWallet = walletItems.find((item) => item.id === wallet);

  const handleWalletChange = (value: string) => {
    setWallet(value);
    setWalletStatus("disconnected");
    setShowReview(false);
    setValidationError("");
    setOrderError("");
  };

  const handleConnectWallet = () => {
    if (!selectedWallet) {
      setValidationError("Please select a wallet first.");
      return;
    }

    setValidationError("");
    setWalletStatus("connecting");

    setTimeout(() => {
      setWalletStatus("connected");
    }, 500);
  };

  const handleDeclineWallet = () => {
    setWalletStatus("declined");
    setShowReview(false);
    setValidationError("Wallet connection was declined.");
  };

  const handleDisconnectWallet = () => {
    setWalletStatus("disconnected");
    setShowReview(false);
    setValidationError("");
  };

  const handleReviewOrder = () => {
    setValidationError("");
    setOrderError("");

    if (!collectorName.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }

    if (!collectorEmail.trim()) {
      setValidationError("Please enter your email.");
      return;
    }

    if (!collectorEmail.includes("@")) {
      setValidationError("Please enter a valid email.");
      return;
    }

    if (!wallet) {
      setValidationError("Please select a wallet.");
      return;
    }

    if (!selectedWallet) {
      setValidationError("The selected wallet is not available.");
      return;
    }

    if (!network) {
      setValidationError("Please select a network.");
      return;
    }

    if (walletStatus !== "connected") {
      setValidationError(
        "Please connect your wallet before reviewing the order.",
      );
      return;
    }

    setShowReview(true);
  };

  const handleConfirmOrder = async () => {
    setOrderError("");
    setOrderStatus("idle");
    setTransactionId(null);

    const previousQuote = quote.quote;

    try {
      const refreshedQuote = await quote.createQuote({
        items: items.map((item) => ({
          nftId: item.nftId,
          quantity: item.quantity,
        })),
        coupon: previousQuote?.coupon,
      });

      const quoteChanged =
        previousQuote &&
        (previousQuote.subtotalEth !== refreshedQuote.subtotalEth ||
          previousQuote.discountEth !== refreshedQuote.discountEth ||
          previousQuote.networkFeeEth !== refreshedQuote.networkFeeEth ||
          previousQuote.totalEth !== refreshedQuote.totalEth ||
          previousQuote.coupon !== refreshedQuote.coupon ||
          previousQuote.items.length !== refreshedQuote.items.length ||
          previousQuote.items.some((previousItem) => {
            const refreshedItem = refreshedQuote.items.find(
              (item) => item.nftId === previousItem.nftId,
            );

            return (
              !refreshedItem ||
              refreshedItem.quantity !== previousItem.quantity ||
              refreshedItem.unitPriceEth !== previousItem.unitPriceEth
            );
          }));

      if (quoteChanged) {
        setOrderError(
          "The order details have changed. Please review the updated quote before confirming again.",
        );
        setShowReview(true);
        return;
      }

      const currentQuote = refreshedQuote;

      setIsCreatingOrder(true);

      let createdOrderId = "";

      startRealtime({
        onOrderUpdated: (event) => {
          if (!createdOrderId || event.id !== createdOrderId) {
            return;
          }

          if (event.status === "pending") {
            setOrderStatus("pending");
            return;
          }

          if (event.status === "confirmed") {
            setOrderStatus("confirmed");
            setTransactionId(event.transactionId);
            stopRealtime();

            void navigate({
              to: "/confirmation",
              search: {
                orderId: createdOrderId,
              },
            });

            return;
          }

          if (event.status === "rejected") {
            setOrderStatus("rejected");
            setOrderError("Your order was rejected. Please try again.");
            stopRealtime();
          }
        },
      });

      try {
        const order = await createOrder({
          quoteId: currentQuote.id,
          idempotencyKey,
        });

        createdOrderId = order.id;
        setOrderId(order.id);
        setOrderStatus(order.status);

        if (order.status === "confirmed") {
          setTransactionId(order.transactionId);
          stopRealtime();

          void navigate({
            to: "/confirmation",
            search: {
              orderId: order.id,
            },
          });
        }

        if (order.status === "rejected") {
          setOrderError("Your order was rejected. Please try again.");
          stopRealtime();
        }
      } catch {
        stopRealtime();
        setOrderError("Unable to create the order. Please try again.");
      } finally {
        setIsCreatingOrder(false);
      }
    } catch {
      setOrderError("Unable to validate the order. Please try again.");
    }
  };

  const walletStatusMessage =
    walletStatus === "connecting"
      ? "Connecting wallet..."
      : walletStatus === "connected"
        ? "Wallet connected."
        : walletStatus === "declined"
          ? "Wallet connection declined."
          : "Wallet not connected.";

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-gray-500">NFT Marketplace</p>

        <h1 className="mt-2 text-3xl font-semibold">Checkout</h1>
      </div>

      {showReview && (
        <div role="status" className="mb-8 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Review your order</h2>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Collector:</span> {collectorName}
            </p>

            <p>
              <span className="text-gray-500">Email:</span> {collectorEmail}
            </p>

            <p>
              <span className="text-gray-500">Wallet:</span>{" "}
              {selectedWallet?.label ?? selectedWallet?.address}
            </p>

            <p>
              <span className="text-gray-500">Network:</span> {network}
            </p>

            {quote.quote && (
              <p>
                <span className="text-gray-500">Quote:</span> {quote.quote.id}
              </p>
            )}

            {orderId && (
              <p>
                <span className="text-gray-500">Order:</span> {orderId}
              </p>
            )}
          </div>

          {orderStatus === "pending" && (
            <div role="status" className="mt-5 rounded-lg border p-4 text-sm">
              Processing your order...
            </div>
          )}

          {orderStatus === "confirmed" && (
            <div role="status" className="mt-5 rounded-lg border p-4 text-sm">
              Order confirmed.
              {transactionId && (
                <span className="mt-1 block">Transaction: {transactionId}</span>
              )}
            </div>
          )}

          {orderError && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {orderError}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              void handleConfirmOrder();
            }}
            disabled={
              isCreatingOrder ||
              orderStatus === "pending" ||
              orderStatus === "confirmed"
            }
            className="mt-6 w-full rounded-lg border px-6 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreatingOrder
              ? "Creating order..."
              : orderStatus === "pending"
                ? "Processing order..."
                : orderStatus === "confirmed"
                  ? "Order confirmed"
                  : "Confirm order"}
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-8">
          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Collector information</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="collector-name" className="text-sm font-medium">
                  Full name
                </label>

                <input
                  id="collector-name"
                  name="collector-name"
                  type="text"
                  autoComplete="name"
                  value={collectorName}
                  onChange={(event) => {
                    setCollectorName(event.target.value);
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="collector-email"
                  className="text-sm font-medium"
                >
                  Email
                </label>

                <input
                  id="collector-email"
                  name="collector-email"
                  type="email"
                  autoComplete="email"
                  value={collectorEmail}
                  onChange={(event) => {
                    setCollectorEmail(event.target.value);
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Wallet</h2>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="wallet" className="text-sm font-medium">
                  Wallet
                </label>

                <select
                  id="wallet"
                  name="wallet"
                  value={wallet}
                  onChange={(event) => {
                    handleWalletChange(event.target.value);
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="" disabled>
                    Select a wallet
                  </option>

                  {walletItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} — {item.network}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="network" className="text-sm font-medium">
                  Network
                </label>

                <select
                  id="network"
                  name="network"
                  value={network}
                  onChange={(event) => {
                    setNetwork(event.target.value);
                    setShowReview(false);
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  {walletItems.length > 0 ? (
                    Array.from(
                      new Set(walletItems.map((item) => item.network)),
                    ).map((walletNetwork) => (
                      <option key={walletNetwork} value={walletNetwork}>
                        {walletNetwork}
                      </option>
                    ))
                  ) : (
                    <option value="ethereum">Ethereum</option>
                  )}
                </select>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Wallet status</p>

                    <p className="mt-1 text-sm text-gray-500">
                      {walletStatusMessage}
                    </p>
                  </div>

                  {walletStatus === "connected" ? (
                    <button
                      type="button"
                      onClick={handleDisconnectWallet}
                      className="rounded-lg border px-4 py-2 text-sm font-medium"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectWallet}
                      disabled={
                        !selectedWallet || walletStatus === "connecting"
                      }
                      className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {walletStatus === "connecting"
                        ? "Connecting..."
                        : "Connect wallet"}
                    </button>
                  )}
                </div>

                {walletStatus !== "connected" &&
                  walletStatus !== "connecting" &&
                  selectedWallet && (
                    <button
                      type="button"
                      onClick={handleDeclineWallet}
                      className="mt-3 text-sm text-gray-500 underline"
                    >
                      Simulate declined connection
                    </button>
                  )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Items</h2>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.nftId} className="flex items-center gap-4">
                  <img
                    src={item.nft.imageUrl}
                    alt={item.nft.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{item.nft.name}</h3>

                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-medium">{item.nft.priceEth} ETH</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Order summary</h2>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>

              <span>{quote.quote?.subtotalEth ?? "—"} ETH</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>

              <span>{quote.quote?.discountEth ?? "0.00000000"} ETH</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Network fee</span>

              <span>{quote.quote?.networkFeeEth ?? "—"} ETH</span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold">Total</span>

              <span className="font-semibold">
                {quote.quote?.totalEth ?? "—"} ETH
              </span>
            </div>
          </div>

          {walletItems.length === 0 && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              No wallet is registered for your account.
            </div>
          )}

          {validationError && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {validationError}
            </div>
          )}

          <button
            type="button"
            onClick={handleReviewOrder}
            disabled={walletItems.length === 0 || walletStatus !== "connected"}
            className="mt-6 w-full rounded-lg border px-6 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Review order
          </button>

          <Link
            to="/cart"
            className="mt-3 block text-center text-sm text-gray-500 underline"
          >
            Back to cart
          </Link>
        </aside>
      </div>
    </main>
  );
}
