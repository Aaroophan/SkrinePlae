"use client"

import { ScreenplayEditor } from "@/components/screenplay-editor"
import { ScreenplayStore } from "@/lib/screenplay-store"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileText, File, FileType } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { exportScreenplay } from "@/lib/export-utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export default function ScreenplayPage() {
  const params = useParams()
  const [screenplay, setScreenplay] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

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

  const handleExport = async (format: "pdf" | "doc" | "txt") => {
    if (!screenplay) return

    setExporting(true)

    try {
      // Get the latest screenplay data
      const store = ScreenplayStore.getInstance()
      const latestScreenplay = store.getScreenplay(screenplay.id)

      if (!latestScreenplay) {
        throw new Error("Screenplay not found")
      }

      await exportScreenplay(latestScreenplay, format)

      let message = ""
      switch (format) {
        case "doc":
          message = "DOCX file exported with optimized page breaks"
          break
        case "pdf":
          message = "PDF generated from DOCX structure for consistency"
          break
        case "txt":
          message = "Text file exported with DOCX-compatible formatting"
          break
      }

      toast({
        title: "Export Successful",
        description: message,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: `Failed to export as ${format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setExporting(false)
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
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                DOCX Optimized
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={exporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {exporting ? "Exporting..." : "Export"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("doc")}>
                    <FileType className="w-4 h-4 mr-2" />
                    Export as DOCX (Primary)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <File className="w-4 h-4 mr-2" />
                    Export as PDF (from DOCX)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("txt")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as TXT (Fallback)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <ScreenplayEditor screenplay={screenplay} />
    </div>
  )
}
