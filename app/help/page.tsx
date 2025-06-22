"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Keyboard, Save, Palette } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 p-4 border-b">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold">Help & Documentation</h1>
          <p className="text-muted-foreground">Learn how to use SkrinePlae effectively</p>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Screenplay Formatting
              </CardTitle>
              <CardDescription>Learn the standard screenplay formatting conventions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Scene Headings</h4>
                <p className="text-sm text-muted-foreground">
                  Start with INT. or EXT., followed by location and time of day.
                </p>
                <div className="bg-muted p-3 rounded font-mono text-sm">EXT. COFFEE SHOP - DAY</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Character Names</h4>
                <p className="text-sm text-muted-foreground">Character names should be in ALL CAPS when they speak.</p>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  JOHN
                  <br />I can't believe this is happening.
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Action Lines</h4>
                <p className="text-sm text-muted-foreground">Describe what happens in the scene using present tense.</p>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  John walks into the coffee shop, looking around nervously.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </CardTitle>
              <CardDescription>Speed up your writing with these keyboard shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Toggle Sidebar</span>
                  <Badge variant="outline">Ctrl + B</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Scene</span>
                  <Badge variant="outline">Ctrl + N</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Save</span>
                  <Badge variant="outline">Ctrl + S</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Toggle Theme</span>
                  <Badge variant="outline">Ctrl + Shift + T</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Auto-Save & Data
              </CardTitle>
              <CardDescription>Understanding how your data is saved and managed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Automatic Saving</h4>
                <p className="text-sm text-muted-foreground">
                  SkrinePlae automatically saves your work every 30 seconds by default. You can adjust this interval in
                  Settings.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Local Storage</h4>
                <p className="text-sm text-muted-foreground">
                  All your screenplays are stored locally in your browser. Make sure to export your work regularly as a
                  backup.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Customization
              </CardTitle>
              <CardDescription>Personalize your writing environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Themes</h4>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes to reduce eye strain during long writing sessions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Font Size</h4>
                <p className="text-sm text-muted-foreground">
                  Adjust the font size in Settings to make text more comfortable to read.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
