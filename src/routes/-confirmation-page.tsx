import { Link, useSearch } from "@tanstack/react-router";
import { useOrder } from "../api/queries/use-orders";

export function ConfirmationPage() {
  const { orderId } = useSearch({
    from: "/confirmation",
  });

  const { data: order, isLoading, isError } = useOrder(orderId ?? "");

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <section className="rounded-xl border p-8 text-center">
          <p className="text-gray-500">Loading order...</p>
        </section>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <section className="rounded-xl border p-8 text-center">
          <h1 className="text-3xl font-semibold">Order not found</h1>

          <p className="mt-4 text-gray-500">
            We could not load the requested order.
          </p>

          <Link
            to="/"
            className="mt-8 inline-block rounded-lg border px-6 py-3 font-medium"
          >
            Back to marketplace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <section className="rounded-xl border p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border text-2xl">
            {order.status === "confirmed" ? "✓" : "…"}
          </div>

          <p className="mt-6 text-sm text-gray-500">NFT Marketplace</p>

          <h1 className="mt-2 text-3xl font-semibold">
            {order.status === "confirmed"
              ? "Order confirmed"
              : order.status === "rejected"
                ? "Order rejected"
                : "Order pending"}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            {order.status === "confirmed"
              ? "Your order has been confirmed successfully."
              : order.status === "rejected"
                ? "Your order could not be confirmed."
                : "Your order is waiting for transaction confirmation."}
          </p>
        </div>

        <div className="mt-8 space-y-4 rounded-lg border p-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="mt-1 font-medium">{order.id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-1 font-medium capitalize">{order.status}</p>
          </div>

          {order.transactionId && (
            <div>
              <p className="text-sm text-gray-500">Transaction</p>
              <p className="mt-1 break-all font-medium">
                {order.transactionId}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="mt-1 font-medium">{order.subtotalEth} ETH</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Discount</p>
            <p className="mt-1 font-medium">{order.discountEth} ETH</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Network fee</p>
            <p className="mt-1 font-medium">{order.networkFeeEth} ETH</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="mt-1 font-medium">{order.totalEth} ETH</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Items</h2>

          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.nftId}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-medium">{item.unitPriceEth} ETH</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-lg border px-6 py-3 text-center font-medium"
          >
            Back to marketplace
          </Link>

          <Link
            to="/profile"
            className="rounded-lg border px-6 py-3 text-center font-medium"
          >
            Go to profile
          </Link>
        </div>
      </section>
    </main>
  );
}
