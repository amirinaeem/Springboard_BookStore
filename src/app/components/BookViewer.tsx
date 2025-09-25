"use client"
//==============================================================
// COMPONENT: BookViewer
// DESCRIPTION: Show PDF/EPUB if available, fallback to Google Books preview.
//==============================================================

import { useEffect, useRef, useState } from "react"
import { Viewer, Worker } from "@react-pdf-viewer/core"
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout"
import ePub from "epubjs"

import "@react-pdf-viewer/core/lib/styles/index.css"
import "@react-pdf-viewer/default-layout/lib/styles/index.css"

interface Props {
  fileUrl: string
  bookId: string
  googleVolumeId?: string
}

export default function BookViewer({ fileUrl, bookId, googleVolumeId }: Props) {
  const [contentType, setContentType] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false) // fallback to Google

  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  // Fallback API stream endpoint
  const effectiveUrl = fileUrl || `/api/books/${bookId}/download?inline=1`

  useEffect(() => {
    if (!fileUrl) {
      setLoading(false)
      return
    }

    async function detect() {
      try {
        const res = await fetch(effectiveUrl, { method: "HEAD" })
        const type = res.headers.get("content-type") || ""
        setContentType(type.toLowerCase())
      } catch (err) {
        console.error("Failed to detect file type", err)
        setFallback(true)
      } finally {
        setLoading(false)
      }
    }
    detect()
  }, [effectiveUrl, fileUrl])

  if (loading) return <p className="text-gray-500">Loading book...</p>

  if (!fallback && contentType.includes("pdf")) {
    return (
      <div className="h-[80vh] border rounded-lg shadow-sm">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl={effectiveUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>
      </div>
    )
  }

  if (!fallback && (contentType.includes("epub") || effectiveUrl.endsWith(".epub"))) {
    return <EpubViewer fileUrl={effectiveUrl} onError={() => setFallback(true)} />
  }

  // ---------- Fallback: Google Books Viewer ----------
  if (googleVolumeId) {
    return (
      <iframe
        src={`https://books.google.com/books?id=${googleVolumeId}&printsec=frontcover&output=embed`}
        className="h-[80vh] w-full border rounded-lg shadow-sm"
        allowFullScreen
      />
    )
  }

  return <p className="text-gray-500">No online version available.</p>
}

function EpubViewer({ fileUrl, onError }: { fileUrl: string; onError?: () => void }) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [rendition, setRendition] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [toc, setToc] = useState<any[]>([])

  useEffect(() => {
    if (!viewerRef.current) return
    try {
      const book = ePub(fileUrl)
      const r = book.renderTo(viewerRef.current, { width: "100%", height: "100%" })
      r.display()
      setRendition(r)
      book.loaded.navigation.then((nav) => setToc(nav.toc))
    } catch (err) {
      console.error("EPUB render failed", err)
      onError?.()
    }
  }, [fileUrl, onError])

  useEffect(() => {
    if (!rendition) return
    rendition.themes.register("dark", { body: { background: "#111", color: "#eee" } })
    rendition.themes.register("light", { body: { background: "#fff", color: "#000" } })
    rendition.themes.select(darkMode ? "dark" : "light")
    rendition.themes.fontSize(`${fontSize}%`)
  }, [rendition, darkMode, fontSize])

  return (
    <div className="flex h-[80vh] border rounded-lg shadow-sm">
      {toc.length > 0 && (
        <aside className="w-64 border-r overflow-y-auto bg-gray-50 p-2">
          <h2 className="font-semibold mb-2">Chapters</h2>
          <ul className="space-y-1 text-sm">
            {toc.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => rendition.display(item.href)}
                  className="w-full text-left hover:underline"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-4 p-2 border-b bg-gray-50">
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="px-3 py-1 border rounded hover:bg-gray-200"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize((s) => Math.max(80, s - 10))}
              className="px-2 py-1 border rounded hover:bg-gray-200"
            >
              A-
            </button>
            <span>{fontSize}%</span>
            <button
              onClick={() => setFontSize((s) => Math.min(200, s + 10))}
              className="px-2 py-1 border rounded hover:bg-gray-200"
            >
              A+
            </button>
          </div>
        </div>
        <div ref={viewerRef} className="flex-1" />
      </div>
    </div>
  )
}
