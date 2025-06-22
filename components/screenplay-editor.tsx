"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, GripVertical } from "lucide-react"
import ScreenplayManager, { type Scene } from "@/lib/screenplay-manager"

interface ScreenplayEditorProps {
  screenplayId: string
}

export function ScreenplayEditor({ screenplayId }: ScreenplayEditorProps) {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [newSceneHeading, setNewSceneHeading] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const manager = ScreenplayManager.getInstance()

  useEffect(() => {
    const screenplay = manager.setCurrentScreenplay(screenplayId)
    if (screenplay) {
      setScenes(screenplay.scenes)
      if (screenplay.scenes.length > 0) {
        setActiveSceneId(screenplay.scenes[0].id)
      }
    }
  }, [screenplayId])

  const addScene = () => {
    if (!newSceneHeading.trim()) return

    const scene = manager.addScene(newSceneHeading)
    setScenes([...scenes, scene])
    setActiveSceneId(scene.id)
    setNewSceneHeading("")
  }

  const updateSceneContent = (sceneId: string, content: string) => {
    manager.updateScene(sceneId, content)
    setScenes(scenes.map((s) => (s.id === sceneId ? { ...s, content } : s)))
  }

  const deleteScene = (sceneId: string) => {
    manager.deleteScene(sceneId)
    const updatedScenes = scenes.filter((s) => s.id !== sceneId)
    setScenes(updatedScenes)

    if (activeSceneId === sceneId) {
      setActiveSceneId(updatedScenes.length > 0 ? updatedScenes[0].id : null)
    }
  }

  const activeScene = scenes.find((s) => s.id === activeSceneId)

  const formatScreenplayText = (text: string) => {
    return text
      .split("\n")
      .map((line, index) => {
        const trimmed = line.trim()

        // Scene headings (INT./EXT.)
        if (trimmed.match(/^(INT\.|EXT\.|FADE IN:|FADE OUT:)/i)) {
          return `<div key=${index} class="font-bold uppercase mb-4 mt-6">${trimmed}</div>`
        }

        // Character names (all caps, centered-ish)
        if (trimmed.match(/^[A-Z][A-Z\s]+$/) && trimmed.length < 30) {
          return `<div key=${index} class="font-bold uppercase text-center my-4">${trimmed}</div>`
        }

        // Parentheticals
        if (trimmed.match(/^$$.+$$$/)) {
          return `<div key=${index} class="text-center italic mb-2">${trimmed}</div>`
        }

        // Regular action/dialogue
        return `<div key=${index} class="mb-2 leading-relaxed">${trimmed || "<br>"}</div>`
      })
      .join("")
  }

  return (
    <div className="flex h-full">
      {/* Scene Navigator */}
      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Scenes</h3>
          <div className="flex gap-2">
            <Input
              placeholder="EXT. LOCATION - DAY"
              value={newSceneHeading}
              onChange={(e) => setNewSceneHeading(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addScene()}
              className="text-sm"
            />
            <Button onClick={addScene} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {scenes.map((scene, index) => (
            <div
              key={scene.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                activeSceneId === scene.id ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
              }`}
              onClick={() => setActiveSceneId(scene.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 opacity-50" />
                  <div>
                    <div className="font-medium text-sm">Scene {index + 1}</div>
                    <div className="text-xs opacity-70 truncate">{scene.sceneHeading}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteScene(scene.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6">
        {activeScene ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <h2 className="text-xl font-bold">{activeScene.sceneHeading}</h2>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border p-8 min-h-[600px] font-mono text-sm leading-relaxed">
              <Textarea
                ref={textareaRef}
                value={activeScene.content}
                onChange={(e) => updateSceneContent(activeScene.id, e.target.value)}
                placeholder="Start writing your scene here...

Example:
FADE IN:

EXT. ROAD - DAY (MORNING)

A sunny morning, leaves are blowing across the road due to the hot wind.

RICKSHAW DRIVER, a poor thin old man with a rickshaw not in a very good condition is pedaling the rickshaw as hard as he can."
                className="w-full min-h-[500px] border-none resize-none focus:ring-0 font-mono text-sm leading-relaxed bg-transparent"
                style={{
                  fontFamily: "Courier New, monospace",
                  lineHeight: "1.6",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Scene Selected</h3>
              <p>Create a new scene or select an existing one to start writing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
