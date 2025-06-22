"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Search, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ScreenplayStore } from "@/lib/screenplay-store"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScreenplayCreationDialog } from "@/components/screenplay-creation-dialog"

export default function HomePage() {
  const [screenplays, setScreenplays] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreationDialog, setShowCreationDialog] = useState(false)

  useEffect(() => {
    const store = ScreenplayStore.getInstance()
    setScreenplays(store.getAllScreenplays())
  }, [])

  const handleCreateScreenplay = (title: string, author: string, description: string) => {
    const store = ScreenplayStore.getInstance()
    const newScreenplay = store.createScreenplay(title)
    store.updateScreenplay(newScreenplay.id, { author, description })
    setScreenplays(store.getAllScreenplays())
    window.location.href = `/script/${newScreenplay.id}`
  }

  const createNewScreenplay = () => {
    setShowCreationDialog(true)
  }

  const filteredScreenplays = screenplays.filter((screenplay) =>
    screenplay.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkrinePlae
              </h1>
              <p className="text-muted-foreground mt-2">Professional screenwriting made simple</p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button onClick={() => setShowCreationDialog(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Screenplay
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search screenplays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Screenplays Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredScreenplays.map((screenplay) => (
              <Link key={screenplay.id} href={`/script/${screenplay.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg truncate">{screenplay.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(screenplay.lastModified).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{screenplay.metadata.pageCount} pages</span>
                        <span>{screenplay.metadata.wordCount} words</span>
                      </div>
                      {screenplay.author && (
                        <div className="text-sm font-medium text-muted-foreground">by {screenplay.author}</div>
                      )}
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {screenplay.description ||
                          (screenplay.blocks.length > 0
                            ? screenplay.blocks[0].content || "Empty screenplay"
                            : "Empty screenplay")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredScreenplays.length === 0 && (
            <div className="text-center py-16">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "No screenplays found" : "Start your first screenplay"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Create your first screenplay and start writing your story with professional formatting."}
              </p>
              {!searchTerm && (
                <Button onClick={createNewScreenplay} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Screenplay
                </Button>
              )}
            </div>
          )}
          <ScreenplayCreationDialog
            open={showCreationDialog}
            onOpenChange={setShowCreationDialog}
            onCreate={handleCreateScreenplay}
          />
        </div>
      </div>
    </div>
  )
}
