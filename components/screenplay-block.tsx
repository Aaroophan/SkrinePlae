"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { BlockType, type ScreenplayBlock } from "@/types/screenplay"
import { cn } from "@/lib/utils"

interface ScreenplayBlockProps {
  block: ScreenplayBlock
  isActive: boolean
  onUpdate: (blockId: string, content: string) => void
  onEnter: (blockId: string, currentType: BlockType) => void
  onTab: (blockId: string, currentType: BlockType) => void
  onBackspace: (blockId: string, isEmpty: boolean) => void
  onFocus: () => void
}

function ScreenplayBlockComponent({
  block,
  isActive,
  onUpdate,
  onEnter,
  onTab,
  onBackspace,
  onFocus,
}: ScreenplayBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState(block.content)

  useEffect(() => {
    setContent(block.content)
  }, [block.content])

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isActive])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onUpdate(block.id, newContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault()
        onEnter(block.id, block.type)
        break
      case "Tab":
        e.preventDefault()
        onTab(block.id, block.type)
        break
      case "Backspace":
        if (content === "" && e.target.selectionStart === 0) {
          e.preventDefault()
          onBackspace(block.id, true)
        }
        break
    }
  }

  const getBlockStyles = () => {
    const baseStyles =
      "screenplay-block outline-none border-none bg-transparent resize-none overflow-hidden min-h-[1.5em] py-1 px-0 leading-relaxed w-full"

    switch (block.type) {
      case BlockType.SCENE_HEADING:
        return cn(baseStyles, "font-bold uppercase mb-4")
      case BlockType.ACTION:
        return cn(baseStyles, "mb-4")
      case BlockType.CHARACTER:
        return cn(baseStyles, "font-bold uppercase mb-1 max-w-md mx-auto text-center")
      case BlockType.DIALOGUE:
        return cn(baseStyles, "mb-1 max-w-md mx-auto ml-24")
      case BlockType.PARENTHETICAL:
        return cn(baseStyles, "italic mb-1 max-w-sm mx-auto ml-32")
      case BlockType.TRANSITION:
        return cn(baseStyles, "font-bold uppercase mb-4 text-right")
      default:
        return baseStyles
    }
  }

  const getPlaceholder = () => {
    switch (block.type) {
      case BlockType.SCENE_HEADING:
        return "INT. LOCATION - TIME"
      case BlockType.ACTION:
        return "Describe the action..."
      case BlockType.CHARACTER:
        return "CHARACTER NAME"
      case BlockType.DIALOGUE:
        return "What the character says..."
      case BlockType.PARENTHETICAL:
        return "(how they say it)"
      case BlockType.TRANSITION:
        return "CUT TO:"
      default:
        return "Start typing..."
    }
  }

  const getContainerStyles = () => {
    switch (block.type) {
      case BlockType.CHARACTER:
        return "flex justify-center"
      case BlockType.DIALOGUE:
        return "ml-24 max-w-md"
      case BlockType.PARENTHETICAL:
        return "ml-32 max-w-sm"
      case BlockType.TRANSITION:
        return "flex justify-end"
      default:
        return "w-full"
    }
  }

  return (
    <div className="relative group">
      {/* Block type indicator */}
      <div className="absolute -left-12 top-1 opacity-0 group-hover:opacity-50 transition-opacity">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{block.type.replace("_", " ")}</span>
      </div>

      <div className={getContainerStyles()}>
        <textarea
          ref={textareaRef}
          data-block-id={block.id}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder={getPlaceholder()}
          className={getBlockStyles()}
          style={{
            fontSize: "12pt",
            lineHeight: "1.5",
            fontFamily: "Courier New, monospace",
            direction: "ltr",
          }}
          dir="ltr"
          rows={1}
        />
      </div>
    </div>
  )
}

export { ScreenplayBlockComponent as ScreenplayBlock }
export default ScreenplayBlockComponent
