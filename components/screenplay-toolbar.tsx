"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, Type, FileText, Zap } from "lucide-react"
import { BlockType } from "@/types/screenplay"

interface ScreenplayToolbarProps {
  onFindReplace: () => void
}

export function ScreenplayToolbar({ onFindReplace }: ScreenplayToolbarProps) {
  const blockTypes = [
    { value: BlockType.SCENE_HEADING, label: "Scene Heading" },
    { value: BlockType.ACTION, label: "Action" },
    { value: BlockType.CHARACTER, label: "Character" },
    { value: BlockType.DIALOGUE, label: "Dialogue" },
    { value: BlockType.PARENTHETICAL, label: "Parenthetical" },
    { value: BlockType.TRANSITION, label: "Transition" },
  ]

  return (
    <div className="border-b bg-background/95 backdrop-blur p-3">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-sm">SkrinePlae Editor</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Select>
          <SelectTrigger className="w-40">
            <Type className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Block Type" />
          </SelectTrigger>
          <SelectContent>
            {blockTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" onClick={onFindReplace}>
          <Search className="w-4 h-4 mr-2" />
          Find
        </Button>

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Enter: Next block</span>
          </div>
          <span>•</span>
          <span>Tab: Change type</span>
          <span>•</span>
          <span>Ctrl+F: Find</span>
        </div>
      </div>
    </div>
  )
}
