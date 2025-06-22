import { BlockType } from "@/types/screenplay"

export function detectBlockType(content: string, currentType: BlockType): BlockType {
  const trimmedContent = content.trim().toUpperCase()

  // Scene heading detection - allow multiple scene headings
  if (
    trimmedContent.startsWith("INT.") ||
    trimmedContent.startsWith("EXT.") ||
    trimmedContent.startsWith("INTERIOR") ||
    trimmedContent.startsWith("EXTERIOR") ||
    (trimmedContent.includes(" - ") && (trimmedContent.includes("INT.") || trimmedContent.includes("EXT.")))
  ) {
    return BlockType.SCENE_HEADING
  }

  // Transition detection
  if (
    trimmedContent.endsWith(":") &&
    (trimmedContent.includes("CUT TO") ||
      trimmedContent.includes("FADE IN") ||
      trimmedContent.includes("FADE OUT") ||
      trimmedContent.includes("DISSOLVE TO") ||
      trimmedContent.includes("SMASH CUT"))
  ) {
    return BlockType.TRANSITION
  }

  // Parenthetical detection
  if (content.trim().startsWith("(") && content.trim().endsWith(")")) {
    return BlockType.PARENTHETICAL
  }

  // Character name detection (all caps, short line)
  if (
    content === trimmedContent &&
    trimmedContent.length > 0 &&
    trimmedContent.length < 40 &&
    trimmedContent.split(" ").length <= 3 && // Allow up to 3 words for character names
    currentType !== BlockType.DIALOGUE &&
    !trimmedContent.includes(".")
  ) {
    return BlockType.CHARACTER
  }

  return currentType
}

export function getNextBlockType(currentType: BlockType, action: "enter" | "tab"): BlockType {
  if (action === "enter") {
    switch (currentType) {
      case BlockType.SCENE_HEADING:
        return BlockType.ACTION
      case BlockType.ACTION:
        return BlockType.ACTION
      case BlockType.CHARACTER:
        return BlockType.DIALOGUE
      case BlockType.DIALOGUE:
        return BlockType.ACTION
      case BlockType.PARENTHETICAL:
        return BlockType.DIALOGUE
      case BlockType.TRANSITION:
        return BlockType.SCENE_HEADING
      default:
        return BlockType.ACTION
    }
  } else if (action === "tab") {
    switch (currentType) {
      case BlockType.SCENE_HEADING:
        return BlockType.ACTION
      case BlockType.ACTION:
        return BlockType.CHARACTER
      case BlockType.CHARACTER:
        return BlockType.DIALOGUE
      case BlockType.DIALOGUE:
        return BlockType.PARENTHETICAL
      case BlockType.PARENTHETICAL:
        return BlockType.TRANSITION
      case BlockType.TRANSITION:
        return BlockType.SCENE_HEADING
      default:
        return BlockType.ACTION
    }
  }

  return currentType
}
