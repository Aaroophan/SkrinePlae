"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TitlePageGenerator } from "@/components/title-page-generator"
import ScreenplayManager, { type Screenplay } from "@/lib/screenplay-manager"

interface TitlePageProps {
    params: { id: string }
}

export default function TitlePagePage({ params }: TitlePageProps) {
    const [screenplay, setScreenplay] = useState<Screenplay | null>(null)
    const manager = ScreenplayManager.getInstance()

    useEffect(() => {
        const sp = manager.setCurrentScreenplay(params.id)
        setScreenplay(sp)
    }, [params.id])

    if (!screenplay) {
        return (
            <div className="flex items-center justify-center h-full">
                <div>Loading...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center gap-4 p-4 border-b">
                <SidebarTrigger />
                <div>
                    <h1 className="text-xl font-semibold">Title Page</h1>
                    <p className="text-sm text-muted-foreground">{screenplay.title}</p>
                </div>
            </header>

            <div className="flex-1 p-6 overflow-y-auto">
                <TitlePageGenerator metadata={screenplay.metadata} />
            </div>
        </div>
    )
}
