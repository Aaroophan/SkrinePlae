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

export function ScreenplayBlockComponent({
  block,
  isActive,
  onUpdate,
  onEnter,
  onTab,
  onBackspace,
  onFocus,
}: ScreenplayBlockProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(block.content)

  useEffect(() => {
    setContent(block.content)
  }, [block.content])

  useEffect(() => {
    if (isActive && elementRef.current) {
      elementRef.current.focus()
    }
  }, [isActive])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ""
    setContent(newContent)
    onUpdate(block.id, newContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        if (content === "") {
          e.preventDefault()
          onBackspace(block.id, true)
        }
        break
    }
  }

  const getBlockStyles = () => {
    const baseStyles = "outline-none min-h-[1.5em] py-1 px-0 leading-relaxed"

    switch (block.type) {
      case BlockType.SCENE_HEADING:
        return cn(baseStyles, "font-bold uppercase text-left mb-4")
      case BlockType.ACTION:
        return cn(baseStyles, "text-left mb-4 max-w-full")
      case BlockType.CHARACTER:
        return cn(baseStyles, "font-bold uppercase text-center mb-1 max-w-md mx-auto")
      case BlockType.DIALOGUE:
        return cn(baseStyles, "text-left mb-1 max-w-md mx-auto ml-24")
      case BlockType.PARENTHETICAL:
        return cn(baseStyles, "italic text-left mb-1 max-w-sm mx-auto ml-32")
      case BlockType.TRANSITION:
        return cn(baseStyles, "font-bold uppercase text-right mb-4")
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

  return (
    <div className="relative group">
      {/* Block type indicator */}
      <div className="absolute -left-12 top-1 opacity-0 group-hover:opacity-50 transition-opacity">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{block.type.replace("_", " ")}</span>
      </div>

      <div
        ref={elementRef}
        data-block-id={block.id}
        contentEditable
        suppressContentEditableWarning
        className={getBlockStyles()}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        data-placeholder={content === "" ? getPlaceholder() : ""}
        style={{
          fontSize: "12pt",
          lineHeight: "1.5",
        }}
      >
        {content}
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export const ScreenplayBlock = ScreenplayBlockComponent
