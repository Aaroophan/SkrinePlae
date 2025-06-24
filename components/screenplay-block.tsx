"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { BlockType, type ScreenplayBlock } from "@/types/screenplay"
import { cn } from "@/lib/utils"
import { ScreenplayFormattingStandards } from "@/lib/screenplay-formatting-standards"

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
  const blockRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(block.content)
  const [isHovered, setIsHovered] = useState(false)
  const [blockTypePosition, setBlockTypePosition] = useState<"left" | "right" | "top">("left")

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

  // Calculate optimal position for block type indicator
  useEffect(() => {
    if (isHovered && blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      // Check if there's enough space on the left
      if (rect.left > 200) {
        setBlockTypePosition("left")
      }
      // Check if there's enough space on the right
      else if (viewportWidth - rect.right > 200) {
        setBlockTypePosition("right")
      }
      // Fallback to top if neither side has space
      else {
        setBlockTypePosition("top")
      }
    }
  }, [isHovered])

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
        if (content === "" && e.currentTarget.selectionStart === 0) {
          e.preventDefault()
          onBackspace(block.id, true)
        }
        break
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const getElementFormatting = () => {
    const standards = ScreenplayFormattingStandards
    let elementKey = ""

    switch (block.type) {
      case BlockType.SCENE_HEADING:
        elementKey = "SCENE_HEADING"
        break
      case BlockType.ACTION:
        elementKey = "ACTION"
        break
      case BlockType.CHARACTER:
        elementKey = "CHARACTER"
        break
      case BlockType.DIALOGUE:
        elementKey = "DIALOGUE"
        break
      case BlockType.PARENTHETICAL:
        elementKey = "PARENTHETICAL"
        break
      case BlockType.TRANSITION:
        elementKey = "TRANSITION"
        break
      default:
        elementKey = "ACTION"
    }

    return standards.getElementMargins(elementKey)
  }

  const getBlockStyles = () => {
    const formatting = getElementFormatting()
    const standards = ScreenplayFormattingStandards
    const element = standards[block.type.toUpperCase() as keyof typeof ScreenplayFormattingStandards] as any

    const baseStyles = cn(
      "screenplay-block outline-none border-none bg-transparent resize-none overflow-hidden",
      "transition-all duration-200 leading-none",
      element?.uppercase && "uppercase",
      element?.bold && "font-bold",
    )

    return {
      className: baseStyles,
      style: {
        fontFamily: standards.FONT_FAMILY,
        fontSize: `${standards.FONT_SIZE}pt`,
        lineHeight: `${standards.LINE_HEIGHT}pt`,
        marginLeft: `${formatting.left}mm`,
        marginRight: `${formatting.right}mm`,
        width: `${formatting.width}mm`,
        paddingTop: `${formatting.spacingBefore / 2}pt`,
        paddingBottom: `${formatting.spacingAfter / 2}pt`,
        direction: "ltr" as const,
        textAlign:
          block.type === BlockType.TRANSITION
            ? ("right" as const)
            : block.type === BlockType.CHARACTER
              ? ("left" as const)
              : ("left" as const),
        minHeight: `${standards.LINE_HEIGHT}pt`,
      },
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

  const getBlockTypeColor = () => {
    switch (block.type) {
      case BlockType.SCENE_HEADING:
        return "bg-blue-500 text-white"
      case BlockType.ACTION:
        return "bg-gray-500 text-white"
      case BlockType.CHARACTER:
        return "bg-green-500 text-white"
      case BlockType.DIALOGUE:
        return "bg-purple-500 text-white"
      case BlockType.PARENTHETICAL:
        return "bg-orange-500 text-white"
      case BlockType.TRANSITION:
        return "bg-red-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  const getBlockTypeLabel = () => {
    switch (block.type) {
      case BlockType.SCENE_HEADING:
        return "Scene"
      case BlockType.ACTION:
        return "Action"
      case BlockType.CHARACTER:
        return "Character"
      case BlockType.DIALOGUE:
        return "Dialogue"
      case BlockType.PARENTHETICAL:
        return "Parenthetical"
      case BlockType.TRANSITION:
        return "Transition"
      default:
        return "Unknown"
    }
  }

  const getBlockTypeIndicatorStyles = () => {
    const baseStyles = cn(
      "absolute z-50 px-3 py-1.5 rounded-md text-xs font-medium shadow-lg border border-white/20",
      "transform transition-all duration-200 ease-out",
      "pointer-events-none select-none",
      getBlockTypeColor(),
    )

    switch (blockTypePosition) {
      case "left":
        return cn(baseStyles, "right-full mr-4 top-1/2 -translate-y-1/2", "animate-in slide-in-from-right-2 fade-in-0")
      case "right":
        return cn(baseStyles, "left-full ml-4 top-1/2 -translate-y-1/2", "animate-in slide-in-from-left-2 fade-in-0")
      case "top":
        return cn(
          baseStyles,
          "bottom-full mb-2 left-1/2 -translate-x-1/2",
          "animate-in slide-in-from-bottom-2 fade-in-0",
        )
      default:
        return baseStyles
    }
  }

  const blockStyles = getBlockStyles()

  return (
    <div
      ref={blockRef}
      className="relative group w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        marginBottom: `${getElementFormatting().spacingAfter}pt`,
      }}
    >
      {/* Enhanced Block type indicator with smart positioning */}
      {isHovered && (
        <div className={getBlockTypeIndicatorStyles()}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/30"></div>
            <span className="whitespace-nowrap font-semibold">{getBlockTypeLabel()}</span>
          </div>

          {/* Arrow pointing to the block */}
          <div
            className={cn(
              "absolute w-0 h-0",
              blockTypePosition === "left" &&
              "left-full top-1/2 -translate-y-1/2 border-l-4 border-y-4 border-r-0 border-l-current border-y-transparent",
              blockTypePosition === "right" &&
              "right-full top-1/2 -translate-y-1/2 border-r-4 border-y-4 border-l-0 border-r-current border-y-transparent",
              blockTypePosition === "top" &&
              "top-full left-1/2 -translate-x-1/2 border-t-4 border-x-4 border-b-0 border-t-current border-x-transparent",
            )}
            style={{ color: "inherit" }}
          />
        </div>
      )}

      {/* Subtle hover background */}
      <div
        className={cn(
          "absolute inset-0 rounded-md transition-all duration-200",
          isHovered && "bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-200/50 dark:ring-blue-800/50",
        )}
      />

      {/* Block content with industry-standard formatting */}
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          data-block-id={block.id}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder={getPlaceholder()}
          className={blockStyles.className}
          style={blockStyles.style}
          dir="ltr"
          rows={1}
        />
      </div>

      {/* Focus indicator */}
      {isActive && (
        <div className="absolute -inset-1 rounded-md ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 pointer-events-none" />
      )}

      {/* Mobile-friendly block type indicator */}
      <div
        className={cn(
          "absolute -left-2 top-0 w-1 h-full rounded-full transition-all duration-200 md:hidden",
          isActive && getBlockTypeColor().split(" ")[0].replace("bg-", "bg-"),
          !isActive && "bg-gray-300 dark:bg-gray-600 opacity-50",
        )}
      />
    </div>
  )
}

export { ScreenplayBlockComponent as ScreenplayBlock }
export default ScreenplayBlockComponent
