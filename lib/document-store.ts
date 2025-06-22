interface Document {
  id: string
  title: string
  content: string
  createdAt: Date
  lastModified: Date
}

export class DocumentStore {
  private static instance: DocumentStore
  private documents: Map<string, Document> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): DocumentStore {
    if (!DocumentStore.instance) {
      DocumentStore.instance = new DocumentStore()
    }
    return DocumentStore.instance
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("documents")
      if (stored) {
        try {
          const docs = JSON.parse(stored)
          docs.forEach((doc: any) => {
            this.documents.set(doc.id, {
              ...doc,
              createdAt: new Date(doc.createdAt),
              lastModified: new Date(doc.lastModified),
            })
          })
        } catch (error) {
          console.error("Failed to load documents from storage:", error)
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      const docs = Array.from(this.documents.values())
      localStorage.setItem("documents", JSON.stringify(docs))
    }
  }

  createDocument(title: string, id?: string): Document {
    const docId = id || this.generateId()
    const document: Document = {
      id: docId,
      title,
      content: "<div><br></div>",
      createdAt: new Date(),
      lastModified: new Date(),
    }

    this.documents.set(docId, document)
    this.saveToStorage()
    return document
  }

  getDocument(id: string): Document | undefined {
    return this.documents.get(id)
  }

  updateDocument(id: string, updates: Partial<Omit<Document, "id" | "createdAt">>) {
    const document = this.documents.get(id)
    if (document) {
      const updatedDoc = {
        ...document,
        ...updates,
        lastModified: new Date(),
      }
      this.documents.set(id, updatedDoc)
      this.saveToStorage()
      return updatedDoc
    }
    return null
  }

  deleteDocument(id: string): boolean {
    const deleted = this.documents.delete(id)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values()).sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}
