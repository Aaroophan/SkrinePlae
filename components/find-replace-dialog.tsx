"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Replace, ChevronDown, ChevronUp } from "lucide-react"
import type { ScreenplayBlock } from "@/types/screenplay"

interface FindReplaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blocks: ScreenplayBlock[]
  onUpdateBlocks: (blocks: ScreenplayBlock[]) => void
}

export function FindReplaceDialog({ open, onOpenChange, blocks, onUpdateBlocks }: FindReplaceDialogProps) {
  const [findText, setFindText] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [currentMatch, setCurrentMatch] = useState(0)
  const [matches, setMatches] = useState<Array<{ blockId: string; index: number }>>([])
  const [showReplace, setShowReplace] = useState(false)

  const findMatches = (searchText: string) => {
    if (!searchText) {
      setMatches([])
      setCurrentMatch(0)
      return
    }

    const foundMatches: Array<{ blockId: string; index: number }> = []
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")

    blocks.forEach((block) => {
      let match
      while ((match = regex.exec(block.content)) !== null) {
        foundMatches.push({ blockId: block.id, index: match.index })
      }
    })

    setMatches(foundMatches)
    setCurrentMatch(foundMatches.length > 0 ? 1 : 0)
  }

  const findNext = () => {
    if (matches.length > 0) {
      const nextMatch = currentMatch < matches.length ? currentMatch + 1 : 1
      setCurrentMatch(nextMatch)
      highlightMatch(nextMatch - 1)
    }
  }

  const findPrevious = () => {
    if (matches.length > 0) {
      const prevMatch = currentMatch > 1 ? currentMatch - 1 : matches.length
      setCurrentMatch(prevMatch)
      highlightMatch(prevMatch - 1)
    }
  }

  const highlightMatch = (matchIndex: number) => {
    if (matches[matchIndex]) {
      const match = matches[matchIndex]
      const blockElement = document.querySelector(`[data-block-id="${match.blockId}"]`)
      if (blockElement) {
        blockElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  const replaceOne = () => {
    if (matches.length === 0 || currentMatch === 0) return

    const match = matches[currentMatch - 1]
    const updatedBlocks = blocks.map((block) => {
      if (block.id === match.blockId) {
        const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        const newContent = block.content.replace(regex, replaceText)
        return { ...block, content: newContent }
      }
      return block
    })

    onUpdateBlocks(updatedBlocks)
    setTimeout(() => findMatches(findText), 100)
  }

  const replaceAll = () => {
    if (!findText) return

    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    const updatedBlocks = blocks.map((block) => ({
      ...block,
      content: block.content.replace(regex, replaceText),
    }))

    onUpdateBlocks(updatedBlocks)
    setMatches([])
    setCurrentMatch(0)
  }

  const handleFindChange = (value: string) => {
    setFindText(value)
    findMatches(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find and Replace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="find">Find</Label>
            <div className="flex gap-2">
              <Input
                id="find"
                value={findText}
                onChange={(e) => handleFindChange(e.target.value)}
                placeholder="Enter text to find..."
              />
              <Button variant="outline" size="sm" onClick={findPrevious} disabled={matches.length === 0}>
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={findNext} disabled={matches.length === 0}>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            {matches.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {currentMatch} of {matches.length} matches
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowReplace(!showReplace)}>
              <Replace className="w-4 h-4 mr-2" />
              {showReplace ? "Hide Replace" : "Show Replace"}
            </Button>
          </div>

          {showReplace && (
            <div className="space-y-2">
              <Label htmlFor="replace">Replace with</Label>
              <Input
                id="replace"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Enter replacement text..."
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={replaceOne} disabled={matches.length === 0}>
                  Replace
                </Button>
                <Button variant="outline" size="sm" onClick={replaceAll} disabled={matches.length === 0}>
                  Replace All
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
