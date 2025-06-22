"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import ScreenplayManager, { type UserSettings } from "@/lib/screenplay-manager"

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
    fontSize: 12,
    autoSave: true,
    autoSaveInterval: 30000,
  })
  const { theme, setTheme } = useTheme()
  const manager = ScreenplayManager.getInstance()

  useEffect(() => {
    setSettings(manager.getSettings())
  }, [])

  const updateSetting = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    manager.updateSettings({ [key]: value })

    if (key === "theme") {
      setTheme(value)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 p-4 border-b">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your writing experience</p>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of SkrinePlae</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <div className="text-sm text-muted-foreground">Choose your preferred color scheme</div>
                </div>
                <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Font Size</Label>
                  <span className="text-sm text-muted-foreground">{settings.fontSize}pt</span>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting("fontSize", value)}
                  max={18}
                  min={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auto-Save</CardTitle>
              <CardDescription>Configure automatic saving of your work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Auto-Save</Label>
                  <div className="text-sm text-muted-foreground">Automatically save your work while writing</div>
                </div>
                <Switch checked={settings.autoSave} onCheckedChange={(checked) => updateSetting("autoSave", checked)} />
              </div>

              {settings.autoSave && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Auto-Save Interval</Label>
                    <span className="text-sm text-muted-foreground">{settings.autoSaveInterval / 1000}s</span>
                  </div>
                  <Slider
                    value={[settings.autoSaveInterval]}
                    onValueChange={([value]) => updateSetting("autoSaveInterval", value)}
                    max={120000}
                    min={10000}
                    step={5000}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your screenplay data and storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Export All Screenplays
                </Button>
                <Button variant="outline" className="w-full">
                  Import Screenplays
                </Button>
                <Button variant="destructive" className="w-full">
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
