"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Search,
  Undo,
  Redo,
  Palette,
} from "lucide-react"
import { useState, type RefObject } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DocumentToolbarProps {
  editorRef: RefObject<HTMLDivElement>
  onFindReplace: () => void
}

export function DocumentToolbar({ editorRef, onFindReplace }: DocumentToolbarProps) {
  const [fontSize, setFontSize] = useState("12")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [textColor, setTextColor] = useState("#000000")
  const [highlightColor, setHighlightColor] = useState("#ffff00")

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const applyStyle = (style: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const span = document.createElement("span")

      switch (style) {
        case "title":
          executeCommand("formatBlock", "h1")
          executeCommand("fontSize", "7")
          break
        case "heading1":
          executeCommand("formatBlock", "h1")
          executeCommand("fontSize", "6")
          break
        case "heading2":
          executeCommand("formatBlock", "h2")
          executeCommand("fontSize", "5")
          break
        case "heading3":
          executeCommand("formatBlock", "h3")
          executeCommand("fontSize", "4")
          break
        case "normal":
          executeCommand("formatBlock", "div")
          executeCommand("fontSize", "3")
          break
      }
    }
  }

  const setLineSpacing = (spacing: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      executeCommand("formatBlock", "div")
      // Apply line height through CSS
      const div = document.createElement("div")
      div.style.lineHeight = spacing
      executeCommand("insertHTML", div.outerHTML)
    }
  }

  return (
    <div className="border-b bg-background p-2 space-y-2">
      {/* First Row - File operations and basic formatting */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => executeCommand("undo")}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("redo")}>
          <Redo className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" onClick={onFindReplace}>
          <Search className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Select
          value={fontFamily}
          onValueChange={(value) => {
            setFontFamily(value)
            executeCommand("fontName", value)
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={fontSize}
          onValueChange={(value) => {
            setFontSize(value)
            executeCommand("fontSize", value)
          }}
        >
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">8pt</SelectItem>
            <SelectItem value="2">10pt</SelectItem>
            <SelectItem value="3">12pt</SelectItem>
            <SelectItem value="4">14pt</SelectItem>
            <SelectItem value="5">18pt</SelectItem>
            <SelectItem value="6">24pt</SelectItem>
            <SelectItem value="7">36pt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Second Row - Text formatting */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => executeCommand("bold")}>
          <Bold className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("italic")}>
          <Italic className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("underline")}>
          <Underline className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("strikeThrough")}>
          <Strikethrough className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Text Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value)
                      executeCommand("foreColor", e.target.value)
                    }}
                    className="w-12 h-8"
                  />
                  <span className="text-sm">{textColor}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Highlight Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="color"
                    value={highlightColor}
                    onChange={(e) => {
                      setHighlightColor(e.target.value)
                      executeCommand("backColor", e.target.value)
                    }}
                    className="w-12 h-8"
                  />
                  <span className="text-sm">{highlightColor}</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" onClick={() => executeCommand("justifyLeft")}>
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("justifyCenter")}>
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("justifyRight")}>
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("justifyFull")}>
          <AlignJustify className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Select onValueChange={setLineSpacing}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="1.15" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Single</SelectItem>
            <SelectItem value="1.15">1.15</SelectItem>
            <SelectItem value="1.5">1.5</SelectItem>
            <SelectItem value="2">Double</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Third Row - Lists and indentation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => executeCommand("insertUnorderedList")}>
          <List className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("insertOrderedList")}>
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" onClick={() => executeCommand("outdent")}>
          <Outdent className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("indent")}>
          <Indent className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Select onValueChange={applyStyle}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Normal text" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal text</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="heading1">Heading 1</SelectItem>
            <SelectItem value="heading2">Heading 2</SelectItem>
            <SelectItem value="heading3">Heading 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
