export enum BlockType {
  SCENE_HEADING = "scene_heading",
  ACTION = "action",
  CHARACTER = "character",
  DIALOGUE = "dialogue",
  PARENTHETICAL = "parenthetical",
  TRANSITION = "transition",
}

export interface ScreenplayBlock {
  id: string
  type: BlockType
  content: string
  formatting?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
  }
}

export interface ScreenplayDocument {
  id: string
  title: string
  author: string
  description: string
  blocks: ScreenplayBlock[]
  createdAt: Date
  lastModified: Date
  metadata: {
    pageCount: number
    wordCount: number
    characterCount: number
  }
}
