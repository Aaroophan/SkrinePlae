"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ScreenplayCreationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (title: string, author: string, description: string) => void
}

export function ScreenplayCreationDialog({ open, onOpenChange, onCreate }: ScreenplayCreationDialogProps) {
    const [title, setTitle] = useState("")
    const [author, setAuthor] = useState("")
    const [description, setDescription] = useState("")

    const handleCreate = () => {
        const screenplayTitle = title.trim() || "Untitled Screenplay"
        onCreate(screenplayTitle, author.trim(), description.trim())

        // Reset form
        setTitle("")
        setAuthor("")
        setDescription("")
        onOpenChange(false)
    }

    const handleCancel = () => {
        // Reset form
        setTitle("")
        setAuthor("")
        setDescription("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Screenplay</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter screenplay title..."
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Input
                            id="author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Enter author name..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the screenplay..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate}>Create Screenplay</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
