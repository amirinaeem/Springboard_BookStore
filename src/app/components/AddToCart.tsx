"use client";

import { useState } from "react";

interface AddToCartProps {
  book: any;
  fromGoogle?: boolean;
}

export default function AddToCart({ book, fromGoogle }: AddToCartProps) {
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try {
      const isGoogle = fromGoogle || (!!book?.googleVolumeId && !book?.id);

      const payload = isGoogle
        ? { googleData: book, fromGoogle: true }
        : book?.id
        ? { bookId: book.id, qty: 1 }
        : null;

      if (!payload) {
        alert("Invalid book data — cannot add to cart.");
        return;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || "Failed to add to cart");
      }
      alert("Added to cart ✅");
    } catch (e: any) {
      alert(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={add}
      disabled={busy}
      className="px-4 py-2 border rounded-xl hover:bg-gray-100 disabled:opacity-50"
    >
      {busy ? "Adding..." : "Add to Cart"}
    </button>
  );
}
