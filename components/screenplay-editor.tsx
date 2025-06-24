"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ScreenplayBlock } from "./screenplay-block"
import { ScreenplayToolbar } from "./screenplay-toolbar"
import { FindReplaceDialog } from "./find-replace-dialog"
import { ScreenplayPage } from "./screenplay-page"
import { ScreenplayStore } from "@/lib/screenplay-store"
import { EditorState } from "@/lib/editor-state"
import {
  IndustryStandardPageCalculator,
  type IndustryStandardPageBreakInfo,
} from "@/lib/industry-standard-page-calculator"
import type { TitlePageInfo } from "@/lib/title-page-generator"
import { BlockType, type ScreenplayBlock as ScreenplayBlockType } from "@/types/screenplay"
import { detectBlockType, getNextBlockType } from "@/lib/screenplay-parser"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Award, Info, Ruler } from "lucide-react"

interface ScreenplayEditorProps {
  screenplay: any
}

export function ScreenplayEditor({ screenplay }: ScreenplayEditorProps) {
  const [blocks, setBlocks] = useState<ScreenplayBlockType[]>(screenplay.blocks || [])
  const [currentBlockId, setCurrentBlockId] = useState<string>("")
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [pages, setPages] = useState<IndustryStandardPageBreakInfo[]>([])
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [showFormattingGuide, setShowFormattingGuide] = useState(false)
  const [showBlockTypeHelp, setShowBlockTypeHelp] = useState(false)
  const [validationResults, setValidationResults] = useState<{ isValid: boolean; issues: string[] }>({
    isValid: true,
    issues: [],
  })
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorState] = useState(() => EditorState.getInstance())
  const [pageCalculator] = useState(() => new IndustryStandardPageCalculator())

  // Title page information
  const titleInfo: TitlePageInfo = {
    title: screenplay.title || "Untitled Screenplay",
    author: screenplay.author || undefined,
    description: screenplay.description || undefined,
    date: screenplay.createdAt ? new Date(screenplay.createdAt).toLocaleDateString() : undefined,
  }

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

  // Calculate industry-standard page breaks
  useEffect(() => {
    const calculatedPages = pageCalculator.calculateIndustryStandardPageBreaks(blocks, showDebugInfo)
    setPages(calculatedPages)

    // Validate industry-standard page breaks
    const validation = pageCalculator.validateIndustryPageBreaks(calculatedPages)
    setValidationResults(validation)

    if (!validation.isValid) {
      console.warn("Industry Standard Page break validation issues:", validation.issues)
    }
  }, [blocks, pageCalculator, showDebugInfo])

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

  const renderBlocksOnPage = (pageBlocks: ScreenplayBlockType[]) => {
    return pageBlocks.map((block) => (
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
    ))
  }

  return (
    <div className="flex flex-col h-screen" dir="ltr">
      <ScreenplayToolbar onFindReplace={() => setShowFindReplace(true)} />

      {/* Enhanced page count indicator with industry standard compliance */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              {pages.length} page{pages.length !== 1 ? "s" : ""}• {blocks.filter((b) => b.content.trim()).length} blocks
            </span>
            <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1">
              <Award className="w-3 h-3" />
              Industry Standard
            </span>
            {!validationResults.isValid && (
              <span className="text-red-500 text-xs">
                ⚠️ {validationResults.issues.length} formatting issue{validationResults.issues.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFormattingGuide(!showFormattingGuide)}
              className="text-xs"
            >
              <Ruler className="w-3 h-3 mr-1" />
              Format Guide
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBlockTypeHelp(!showBlockTypeHelp)}
              className="text-xs"
            >
              <Info className="w-3 h-3 mr-1" />
              Block Types
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDebugInfo(!showDebugInfo)} className="text-xs">
              {showDebugInfo ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              Debug
            </Button>
            <span className="text-xs">Industry Standard • Courier New 12pt</span>
          </div>
        </div>
      </div>

      {/* Industry standard formatting guide */}
      {showFormattingGuide && (
        <div className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">
              Industry Standard Formatting:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-medium text-green-800 dark:text-green-200">Margins:</div>
                <div>Left: 1.5" (38.1mm)</div>
                <div>Right: 1.0" (25.4mm)</div>
                <div>Top/Bottom: 1.0" (25.4mm)</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-green-800 dark:text-green-200">Typography:</div>
                <div>Font: Courier New 12pt</div>
                <div>Line Height: 12pt (single)</div>
                <div>Characters/Inch: 10</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-green-800 dark:text-green-200">Element Positions:</div>
                <div>Character: 2.2" from left</div>
                <div>Dialogue: 1.0" from left</div>
                <div>Parenthetical: 1.6" from left</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block type help panel */}
      {showBlockTypeHelp && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">Block Type Guide:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-blue-700 dark:text-blue-300">Scene Heading</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Action</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-green-700 dark:text-green-300">Character</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-purple-700 dark:text-purple-300">Dialogue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-orange-700 dark:text-orange-300">Parenthetical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-red-700 dark:text-red-300">Transition</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              💡 All elements follow industry-standard positioning and spacing guidelines.
            </div>
          </div>
        </div>
      )}

      {/* Validation issues display */}
      {!validationResults.isValid && showDebugInfo && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">Industry Standard Issues:</div>
            {validationResults.issues.map((issue, index) => (
              <div key={index} className="text-xs text-red-600 dark:text-red-400">
                • {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry standard compliance info */}
      {showDebugInfo && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
              Industry Standard Compliance:
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
              <div>• Margins: 1.5" left, 1.0" right/top/bottom</div>
              <div>• Typography: Courier New 12pt, single spacing</div>
              <div>• Character positioning: 2.2" from left margin</div>
              <div>• Dialogue positioning: 1.0" from left margin</div>
              <div>• Orphan/widow control for professional presentation</div>
              <div>• Industry-standard page breaks and keep-together rules</div>
            </div>
          </div>
        </div>
      )}

      {/* Main editor area with industry-standard formatting */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-8" dir="ltr">
        <div ref={editorRef} className="max-w-4xl mx-auto" dir="ltr">
          {/* Render content pages with industry-standard formatting */}
          {pages.length > 0 ? (
            pages.map((page, pageIndex) => (
              <ScreenplayPage
                key={`page-${page.pageNumber}`}
                pageNumber={page.pageNumber}
                isLastPage={pageIndex === pages.length - 1}
                usedHeight={page.usedHeight}
                remainingHeight={page.remainingHeight}
                showDebugInfo={showDebugInfo}
              >
                <div className="space-y-0">{renderBlocksOnPage(page.blocks)}</div>
              </ScreenplayPage>
            ))
          ) : (
            // Fallback single content page if no pages calculated yet
            <ScreenplayPage pageNumber={1} isLastPage={true} showDebugInfo={showDebugInfo}>
              <div className="space-y-0">
                {blocks.map((block) => (
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
            </ScreenplayPage>
          )}
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
