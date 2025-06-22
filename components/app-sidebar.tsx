"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Home, FileText, Settings, HelpCircle, Moon, Sun, PenTool } from "lucide-react"
import { useTheme } from "next-themes"
import ScreenplayManager, { type Screenplay } from "@/lib/screenplay-manager"

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { state } = useSidebar()
  const [screenplays, setScreenplays] = useState<Screenplay[]>([])
  const manager = ScreenplayManager.getInstance()

  useEffect(() => {
    setScreenplays(manager.getScreenplays())
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    manager.updateSettings({ theme: newTheme as "light" | "dark" })
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <PenTool className="w-6 h-6" />
          <span className="font-bold text-lg">SkrinePlae</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Screenplays</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {screenplays.slice(0, 5).map((screenplay) => (
                <SidebarMenuItem key={screenplay.id}>
                  <SidebarMenuButton asChild isActive={pathname === `/editor/${screenplay.id}`}>
                    <a href={`/editor/${screenplay.id}`}>
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{screenplay.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
              {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {state === "expanded" && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
