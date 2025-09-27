"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GoogleBookRedirect({ params }: { params: { volumeId: string } }) {
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // 1) Get Google volume (basic)
        const s = await fetch(`/api/books/summary?volumeId=${params.volumeId}`, { cache: "no-store" });
        if (!s.ok) throw new Error("Failed to fetch book from Google");
        const gd = await s.json();
        const v = gd.volumeInfo || gd;

        // 2) Create/find minimal DB record (no file yet)
        const save = await fetch("/api/books/save-from-google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volumeId: params.volumeId,
            googleData: gd,
          }),
        });
        if (!save.ok) {
          const e = await save.json().catch(() => ({}));
          throw new Error(e?.error || "Failed to save book");
        }
        const { book } = await save.json();

        if (!cancelled) router.replace(`/books/${book.id}`);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load");
      }
    }

    run();
    return () => { cancelled = true; };
  }, [params.volumeId, router]);

  if (error) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Couldn’t import</h1>
          <p className="text-sm opacity-70 mb-4">{error}</p>
          <button onClick={() => history.back()} className="border rounded-xl px-4 py-2">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <p className="opacity-70">Saving book and redirecting…</p>
    </div>
  );
}
