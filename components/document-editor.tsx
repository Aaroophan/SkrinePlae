"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { DocumentToolbar } from "./document-toolbar"
import { FindReplaceDialog } from "./find-replace-dialog"
import { DocumentStore } from "@/lib/document-store"
import { EditorState } from "@/lib/editor-state"

interface DocumentEditorProps {
  document: any
}

export function DocumentEditor({ document }: DocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorState] = useState(() => EditorState.getInstance())
  const [showFindReplace, setShowFindReplace] = useState(false)

  useEffect(() => {
    if (editorRef.current && document) {
      editorRef.current.innerHTML = document.content
      editorState.setCurrentDocument(document.id)
    }
  }, [document, editorState])

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      const store = DocumentStore.getInstance()
      store.updateDocument(document.id, { content })
      editorState.saveState(content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "z":
          e.preventDefault()
          if (e.shiftKey) {
            editorState.redo()
          } else {
            editorState.undo()
          }
          if (editorRef.current) {
            editorRef.current.innerHTML = editorState.getCurrentContent()
          }
          break
        case "f":
          e.preventDefault()
          setShowFindReplace(true)
          break
        case "b":
          e.preventDefault()
          document.execCommand("bold")
          break
        case "i":
          e.preventDefault()
          document.execCommand("italic")
          break
        case "u":
          e.preventDefault()
          document.execCommand("underline")
          break
      }
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <DocumentToolbar editorRef={editorRef} onFindReplace={() => setShowFindReplace(true)} />

      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg min-h-full">
          <div
            ref={editorRef}
            contentEditable
            className="p-16 min-h-full outline-none text-gray-900 dark:text-gray-100 leading-relaxed"
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "12pt",
              lineHeight: "1.15",
            }}
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning={true}
          />
        </div>
      </div>

      <FindReplaceDialog open={showFindReplace} onOpenChange={setShowFindReplace} editorRef={editorRef} />
    </div>
  )
}
