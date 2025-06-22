"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, FileText, Zap } from "lucide-react"
import ScreenplayManager, { type Scene } from "@/lib/screenplay-manager"
import { ScreenplayFormatter, type ScreenplayElementType } from "@/lib/screenplay-formatter"

interface SmartScreenplayEditorProps {
    screenplayId: string
}

export function SmartScreenplayEditor({ screenplayId }: SmartScreenplayEditorProps) {
    const [scenes, setScenes] = useState<Scene[]>([])
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
    const [newSceneHeading, setNewSceneHeading] = useState("")
    const [currentElementType, setCurrentElementType] = useState<ScreenplayElementType>("ACTION")
    const [showCommands, setShowCommands] = useState(false)
    const [cursorPosition, setCursorPosition] = useState(0)
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

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const textarea = textareaRef.current
            if (!textarea) return

            const { selectionStart, selectionEnd, value } = textarea
            const lines = value.split("\n")
            const currentLineIndex = value.substring(0, selectionStart).split("\n").length - 1
            const currentLine = lines[currentLineIndex] || ""

            // Handle smart commands
            if (currentLine.startsWith("/") && e.key === " ") {
                e.preventDefault()
                const command = currentLine.substring(1)
                const element = ScreenplayFormatter.handleSmartCommand(command)

                if (element) {
                    const newLines = [...lines]
                    newLines[currentLineIndex] = element.content
                    const newContent = newLines.join("\n")

                    if (activeSceneId) {
                        updateSceneContent(activeSceneId, newContent)
                    }

                    // Position cursor at end of inserted content
                    setTimeout(() => {
                        const newPosition = value.substring(0, selectionStart - currentLine.length) + element.content
                        textarea.setSelectionRange(newPosition.length, newPosition.length)
                    }, 0)
                }
                return
            }

            // Tab cycling between element types
            if (e.key === "Tab") {
                e.preventDefault()
                const nextType = ScreenplayFormatter.getNextElementType(currentElementType)
                setCurrentElementType(nextType)

                // Apply formatting to current line
                const element = ScreenplayFormatter.formatElement(currentLine, nextType)
                const newLines = [...lines]
                newLines[currentLineIndex] = element.content
                const newContent = newLines.join("\n")

                if (activeSceneId) {
                    updateSceneContent(activeSceneId, newContent)
                }
                return
            }

            // Enter key smart formatting
            if (e.key === "Enter") {
                const previousLineType = ScreenplayFormatter.detectElementType(currentLine)
                setCurrentElementType(previousLineType === "CHARACTER" ? "DIALOGUE" : "ACTION")
            }

            // Show command palette
            if (e.key === "/" && currentLine === "") {
                setShowCommands(true)
            } else {
                setShowCommands(false)
            }
        },
        [activeSceneId, currentElementType],
    )

    const handleInput = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const { value, selectionStart } = e.target
            const lines = value.split("\n")
            const currentLineIndex = value.substring(0, selectionStart).split("\n").length - 1
            const currentLine = lines[currentLineIndex] || ""

            // Auto-format as user types
            const previousLineIndex = currentLineIndex - 1
            const previousLine = previousLineIndex >= 0 ? lines[previousLineIndex] : ""
            const previousType = previousLine ? ScreenplayFormatter.detectElementType(previousLine) : undefined

            const element = ScreenplayFormatter.processLine(currentLine, previousType)
            setCurrentElementType(element.type)

            // Apply smart formatting for certain triggers
            if (currentLine.match(/^(INT|EXT)\s/i)) {
                const formatted = ScreenplayFormatter.formatElement(currentLine, "SCENE_HEADING")
                const newLines = [...lines]
                newLines[currentLineIndex] = formatted.content
                const newContent = newLines.join("\n")

                if (activeSceneId) {
                    updateSceneContent(activeSceneId, newContent)
                }

                // Update cursor position
                setTimeout(() => {
                    const newPosition = selectionStart + (formatted.content.length - currentLine.length)
                    e.target.setSelectionRange(newPosition, newPosition)
                }, 0)
                return
            }

            if (activeSceneId) {
                updateSceneContent(activeSceneId, value)
            }
        },
        [activeSceneId],
    )

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

    const insertSmartCommand = (command: string) => {
        const element = ScreenplayFormatter.handleSmartCommand(command)
        if (!element || !textareaRef.current || !activeSceneId) return

        const textarea = textareaRef.current
        const { selectionStart, value } = textarea
        const lines = value.split("\n")
        const currentLineIndex = value.substring(0, selectionStart).split("\n").length - 1

        const newLines = [...lines]
        newLines[currentLineIndex] = element.content
        const newContent = newLines.join("\n")

        updateSceneContent(activeSceneId, newContent)
        setShowCommands(false)

        // Focus back to textarea
        setTimeout(() => {
            textarea.focus()
            const newPosition = value.substring(0, selectionStart - lines[currentLineIndex].length) + element.content
            textarea.setSelectionRange(newPosition.length, newPosition.length)
        }, 0)
    }

    const activeScene = scenes.find((s) => s.id === activeSceneId)

    const smartCommands = [
        { command: "/scene", description: "Insert scene heading", icon: "🎬" },
        { command: "/character", description: "Insert character name", icon: "👤" },
        { command: "/dialogue", description: "Insert dialogue", icon: "💬" },
        { command: "/action", description: "Insert action line", icon: "🎭" },
        { command: "/parenthetical", description: "Insert parenthetical", icon: "📝" },
        { command: "/transition", description: "Insert transition", icon: "➡️" },
        { command: "/fade", description: "Insert fade in", icon: "🌅" },
    ]

    return (
        <div className="flex h-full">
            {/* Scene Navigator */}
            <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
                <div className="mb-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Scenes
                    </h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder="INT. LOCATION - DAY"
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
                            className={`group p-3 rounded-lg cursor-pointer transition-colors ${activeSceneId === scene.id ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
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

                {/* Smart Commands Help */}
                <Card className="mt-6">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Smart Commands
                        </h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div>
                                Type{" "}
                                <Badge variant="outline" className="text-xs">
                                    /scene
                                </Badge>{" "}
                                for scene heading
                            </div>
                            <div>
                                Type{" "}
                                <Badge variant="outline" className="text-xs">
                                    /char
                                </Badge>{" "}
                                for character
                            </div>
                            <div>
                                Press{" "}
                                <Badge variant="outline" className="text-xs">
                                    Tab
                                </Badge>{" "}
                                to cycle formats
                            </div>
                            <div>
                                <Badge variant="outline" className="text-xs">
                                    INT
                                </Badge>{" "}
                                or{" "}
                                <Badge variant="outline" className="text-xs">
                                    EXT
                                </Badge>{" "}
                                auto-formats
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Editor */}
            <div className="flex-1 p-6 relative">
                {activeScene ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">{activeScene.sceneHeading}</h2>
                            <Badge variant="outline" className="text-xs">
                                {currentElementType.replace("_", " ")}
                            </Badge>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-lg border p-8 min-h-[600px] font-mono text-sm leading-relaxed relative">
                            <textarea
                                ref={textareaRef}
                                value={activeScene.content}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Start writing your scene here...

Smart formatting tips:
• Type 'INT' or 'EXT' followed by space for scene headings
• Character names in ALL CAPS become dialogue blocks
• Use /scene, /character, /dialogue for quick formatting
• Press Tab to cycle between element types

Example:
INT. COFFEE SHOP - DAY

SARAH enters, looking around nervously.

SARAH
(whispering)
I think someone's following me."
                                className="w-full min-h-[500px] border-none resize-none focus:ring-0 font-mono text-sm leading-relaxed bg-transparent"
                                style={{
                                    fontFamily: "Courier New, monospace",
                                    lineHeight: "1.6",
                                }}
                            />

                            {/* Smart Commands Popup */}
                            {showCommands && (
                                <Card className="absolute top-4 left-4 z-10 w-80">
                                    <CardContent className="p-2">
                                        <div className="text-sm font-semibold mb-2">Smart Commands</div>
                                        <div className="space-y-1">
                                            {smartCommands.map((cmd) => (
                                                <button
                                                    key={cmd.command}
                                                    onClick={() => insertSmartCommand(cmd.command)}
                                                    className="w-full text-left p-2 rounded hover:bg-muted transition-colors flex items-center gap-2"
                                                >
                                                    <span>{cmd.icon}</span>
                                                    <div>
                                                        <div className="font-mono text-xs">{cmd.command}</div>
                                                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
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
