"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ScreenplayEditor } from "@/components/screenplay-editor"

interface EditorPageProps {
  params: { id: string }
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id } = params

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 p-4 border-b">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Screenplay Editor</h1>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScreenplayEditor screenplayId={id} />
      </div>
    </div>
  )
}
