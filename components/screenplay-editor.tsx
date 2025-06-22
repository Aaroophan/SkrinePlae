"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ScreenplayBlock } from "./screenplay-block"
import { ScreenplayToolbar } from "./screenplay-toolbar"
import { FindReplaceDialog } from "./find-replace-dialog"
import { ScreenplayStore } from "@/lib/screenplay-store"
import { EditorState } from "@/lib/editor-state"
import { BlockType, type ScreenplayBlock as ScreenplayBlockType } from "@/types/screenplay"
import { detectBlockType, getNextBlockType } from "@/lib/screenplay-parser"

interface ScreenplayEditorProps {
  screenplay: any
}

export function ScreenplayEditor({ screenplay }: ScreenplayEditorProps) {
  const [blocks, setBlocks] = useState<ScreenplayBlockType[]>(screenplay.blocks || [])
  const [currentBlockId, setCurrentBlockId] = useState<string>("")
  const [showFindReplace, setShowFindReplace] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorState] = useState(() => EditorState.getInstance())

  useEffect(() => {
    if (blocks.length === 0) {
      // Initialize with a scene heading block
      const initialBlock: ScreenplayBlockType = {
        id: generateId(),
        type: BlockType.SCENE_HEADING,
        content: "",
      }
      setBlocks([initialBlock])
      setCurrentBlockId(initialBlock.id)
    }
  }, [])

  useEffect(() => {
    // Auto-save
    const store = ScreenplayStore.getInstance()
    store.updateScreenplay(screenplay.id, { blocks })
  }, [blocks, screenplay.id])

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  const updateBlock = useCallback((blockId: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === blockId) {
          const detectedType = detectBlockType(content, block.type)
          return { ...block, content, type: detectedType }
        }
        return block
      }),
    )
  }, [])

  const handleEnter = useCallback(
    (blockId: string, currentType: BlockType) => {
      const blockIndex = blocks.findIndex((b) => b.id === blockId)
      if (blockIndex === -1) return

      const nextType = getNextBlockType(currentType, "enter")
      const newBlock: ScreenplayBlockType = {
        id: generateId(),
        type: nextType,
        content: "",
      }

      setBlocks((prev) => [...prev.slice(0, blockIndex + 1), newBlock, ...prev.slice(blockIndex + 1)])

      setCurrentBlockId(newBlock.id)

      // Focus the new block after state update
      setTimeout(() => {
        const newBlockElement = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLTextAreaElement
        if (newBlockElement) {
          newBlockElement.focus()
        }
      }, 0)
    },
    [blocks],
  )

  const handleTab = useCallback((blockId: string, currentType: BlockType) => {
    const nextType = getNextBlockType(currentType, "tab")
    setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, type: nextType } : block)))
  }, [])

  const handleBackspace = useCallback(
    (blockId: string, isEmpty: boolean) => {
      if (!isEmpty) return

      const blockIndex = blocks.findIndex((b) => b.id === blockId)
      if (blockIndex <= 0) return // Don't delete the first block

      // Remove current block and focus previous
      const previousBlock = blocks[blockIndex - 1]
      setBlocks((prev) => prev.filter((b) => b.id !== blockId))
      setCurrentBlockId(previousBlock.id)

      setTimeout(() => {
        const prevBlockElement = document.querySelector(`[data-block-id="${previousBlock.id}"]`) as HTMLTextAreaElement
        if (prevBlockElement) {
          prevBlockElement.focus()
          // Move cursor to end
          prevBlockElement.setSelectionRange(prevBlockElement.value.length, prevBlockElement.value.length)
        }
      }, 0)
    },
    [blocks],
  )

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "f":
          e.preventDefault()
          setShowFindReplace(true)
          break
        case "z":
          e.preventDefault()
          // Handle undo/redo
          break
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex flex-col h-screen" dir="ltr">
      <ScreenplayToolbar onFindReplace={() => setShowFindReplace(true)} />

      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-4" dir="ltr">
        <div
          className="mx-auto bg-white dark:bg-gray-900 shadow-xl"
          style={{
            width: "210mm", // A4 width
            minHeight: "297mm", // A4 height
            maxWidth: "210mm",
          }}
          dir="ltr"
        >
          <div
            ref={editorRef}
            className="p-16 min-h-full"
            style={{
              fontFamily: "Courier New, monospace",
            }}
            dir="ltr"
          >
            {blocks.map((block, index) => (
              <ScreenplayBlock
                key={block.id}
                block={block}
                isActive={currentBlockId === block.id}
                onUpdate={updateBlock}
                onEnter={handleEnter}
                onTab={handleTab}
                onBackspace={handleBackspace}
                onFocus={() => setCurrentBlockId(block.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <FindReplaceDialog
        open={showFindReplace}
        onOpenChange={setShowFindReplace}
        blocks={blocks}
        onUpdateBlocks={setBlocks}
      />
    </div>
  )
}
