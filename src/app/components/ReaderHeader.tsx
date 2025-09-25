"use client"
//==============================================================
// COMPONENT: ReaderHeader
// DESCRIPTION: Title + fullscreen button (client-side events).
//==============================================================

export default function ReaderHeader({ title }: { title: string }) {
  const goFullscreen = () => {
    if (typeof document !== "undefined") {
      document.documentElement.requestFullscreen?.()
    }
  }

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <button
        onClick={goFullscreen}
        className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
      >
        Fullscreen
      </button>
    </div>
  )
}
