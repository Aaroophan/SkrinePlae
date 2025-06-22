import { type ScreenplayDocument, type ScreenplayBlock, BlockType } from "@/types/screenplay"

export class ScreenplayStore {
  private static instance: ScreenplayStore
  private screenplays: Map<string, ScreenplayDocument> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): ScreenplayStore {
    if (!ScreenplayStore.instance) {
      ScreenplayStore.instance = new ScreenplayStore()
    }
    return ScreenplayStore.instance
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("screenplays")
      if (stored) {
        try {
          const scripts = JSON.parse(stored)
          scripts.forEach((script: any) => {
            this.screenplays.set(script.id, {
              ...script,
              createdAt: new Date(script.createdAt),
              lastModified: new Date(script.lastModified),
            })
          })
        } catch (error) {
          console.error("Failed to load screenplays from storage:", error)
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      const scripts = Array.from(this.screenplays.values())
      localStorage.setItem("screenplays", JSON.stringify(scripts))
    }
  }

  private calculateMetadata(blocks: ScreenplayBlock[]) {
    const wordCount = blocks.reduce((count, block) => {
      return count + block.content.split(/\s+/).filter((word) => word.length > 0).length
    }, 0)

    const characterCount = blocks.reduce((count, block) => count + block.content.length, 0)

    // Rough page count calculation (250 words per page)
    const pageCount = Math.max(1, Math.ceil(wordCount / 250))

    return { pageCount, wordCount, characterCount }
  }

  createScreenplay(title: string, id?: string): ScreenplayDocument {
    const scriptId = id || this.generateId()
    const initialBlock: ScreenplayBlock = {
      id: this.generateId(),
      type: BlockType.SCENE_HEADING,
      content: "",
    }

    const screenplay: ScreenplayDocument = {
      id: scriptId,
      title,
      blocks: [initialBlock],
      createdAt: new Date(),
      lastModified: new Date(),
      metadata: this.calculateMetadata([initialBlock]),
    }

    this.screenplays.set(scriptId, screenplay)
    this.saveToStorage()
    return screenplay
  }

  getScreenplay(id: string): ScreenplayDocument | undefined {
    return this.screenplays.get(id)
  }

  updateScreenplay(id: string, updates: Partial<Omit<ScreenplayDocument, "id" | "createdAt">>) {
    const screenplay = this.screenplays.get(id)
    if (screenplay) {
      const updatedScreenplay = {
        ...screenplay,
        ...updates,
        lastModified: new Date(),
        metadata: updates.blocks ? this.calculateMetadata(updates.blocks) : screenplay.metadata,
      }
      this.screenplays.set(id, updatedScreenplay)
      this.saveToStorage()
      return updatedScreenplay
    }
    return null
  }

  deleteScreenplay(id: string): boolean {
    const deleted = this.screenplays.delete(id)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  getAllScreenplays(): ScreenplayDocument[] {
    return Array.from(this.screenplays.values()).sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}
