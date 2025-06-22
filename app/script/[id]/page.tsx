"use client"

import { ScreenplayEditor } from "@/components/screenplay-editor"
import { ScreenplayStore } from "@/lib/screenplay-store"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { exportToPDF, exportToDoc } from "@/lib/export-utils"

export default function ScreenplayPage() {
  const params = useParams()
  const [screenplay, setScreenplay] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const store = ScreenplayStore.getInstance()
    const script = store.getScreenplay(params.id as string)

    if (script) {
      setScreenplay(script)
    } else {
      // Create a new screenplay if it doesn't exist
      const newScript = store.createScreenplay("Untitled Screenplay", params.id as string)
      setScreenplay(newScript)
    }
    setLoading(false)
  }, [params.id])

  const handleExport = async (format: "pdf" | "doc") => {
    if (!screenplay) return

    if (format === "pdf") {
      await exportToPDF(screenplay)
    } else {
      await exportToDoc(screenplay)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading screenplay...</p>
        </div>
      </div>
    )
  }

  if (!screenplay) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Screenplay not found</h2>
          <Link href="/">
            <Button>Back to Screenplays</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-lg font-medium truncate max-w-md">{screenplay.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("doc")} className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Export DOC
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <ScreenplayEditor screenplay={screenplay} />
    </div>
  )
}
