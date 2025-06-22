import type { ScreenplayBlock } from "@/types/screenplay"

interface EditorHistory {
  blocks: ScreenplayBlock[]
  timestamp: number
}

export class EditorState {
  private static instance: EditorState
  private history: EditorHistory[] = []
  private currentIndex = -1
  private maxHistorySize = 50
  private currentScreenplayId = ""

  private constructor() {}

  static getInstance(): EditorState {
    if (!EditorState.instance) {
      EditorState.instance = new EditorState()
    }
    return EditorState.instance
  }

  setCurrentScreenplay(screenplayId: string) {
    this.currentScreenplayId = screenplayId
    this.history = []
    this.currentIndex = -1
  }

  saveState(blocks: ScreenplayBlock[]) {
    // Remove any states after current index
    this.history = this.history.slice(0, this.currentIndex + 1)

    // Add new state
    this.history.push({
      blocks: JSON.parse(JSON.stringify(blocks)), // Deep copy
      timestamp: Date.now(),
    })

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
    }

    this.currentIndex = this.history.length - 1
  }

  undo(): ScreenplayBlock[] | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.history[this.currentIndex].blocks
    }
    return null
  }

  redo(): ScreenplayBlock[] | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.history[this.currentIndex].blocks
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }
}
