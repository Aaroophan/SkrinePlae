"use client"

import { DocumentEditor } from "@/components/document-editor"
import { DocumentStore } from "@/lib/document-store"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DocumentPage() {
  const params = useParams()
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const store = DocumentStore.getInstance()
    const doc = store.getDocument(params.id as string)

    if (doc) {
      setDocument(doc)
    } else {
      // Create a new document if it doesn't exist
      const newDoc = store.createDocument("Untitled Document", params.id as string)
      setDocument(newDoc)
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Document not found</h2>
          <Link href="/">
            <Button>Back to Documents</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-lg font-medium truncate">{document.title}</h1>
          </div>
        </div>
      </div>
      <DocumentEditor document={document} />
    </div>
  )
}
