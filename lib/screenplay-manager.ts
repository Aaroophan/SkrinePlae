export interface Scene {
  id: string
  title: string
  content: string
  sceneHeading: string
  createdAt: Date
  updatedAt: Date
}

export interface Screenplay {
  id: string
  title: string
  author: string
  scenes: Scene[]
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  theme: "light" | "dark"
  fontSize: number
  autoSave: boolean
  autoSaveInterval: number
}

class ScreenplayManager {
  private static instance: ScreenplayManager
  private screenplays: Screenplay[] = []
  private currentScreenplay: Screenplay | null = null
  private settings: UserSettings = {
    theme: "light",
    fontSize: 12,
    autoSave: true,
    autoSaveInterval: 30000,
  }
  private autoSaveTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.loadFromStorage()
    this.setupAutoSave()
  }

  public static getInstance(): ScreenplayManager {
    if (!ScreenplayManager.instance) {
      ScreenplayManager.instance = new ScreenplayManager()
    }
    return ScreenplayManager.instance
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const savedScreenplays = localStorage.getItem("skrineplae-screenplays")
      const savedSettings = localStorage.getItem("skrineplae-settings")
      const savedCurrent = localStorage.getItem("skrineplae-current")

      if (savedScreenplays) {
        this.screenplays = JSON.parse(savedScreenplays).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          scenes: s.scenes.map((scene: any) => ({
            ...scene,
            createdAt: new Date(scene.createdAt),
            updatedAt: new Date(scene.updatedAt),
          })),
        }))
      }

      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
      }

      if (savedCurrent) {
        const currentId = JSON.parse(savedCurrent)
        this.currentScreenplay = this.screenplays.find((s) => s.id === currentId) || null
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("skrineplae-screenplays", JSON.stringify(this.screenplays))
      localStorage.setItem("skrineplae-settings", JSON.stringify(this.settings))
      localStorage.setItem("skrineplae-current", JSON.stringify(this.currentScreenplay?.id || null))
    }
  }

  private setupAutoSave() {
    if (this.settings.autoSave) {
      this.autoSaveTimer = setInterval(() => {
        this.saveToStorage()
      }, this.settings.autoSaveInterval)
    }
  }

  public createScreenplay(title: string, author: string): Screenplay {
    const screenplay: Screenplay = {
      id: Date.now().toString(),
      title,
      author,
      scenes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.screenplays.push(screenplay)
    this.currentScreenplay = screenplay
    this.saveToStorage()
    return screenplay
  }

  public getScreenplays(): Screenplay[] {
    return this.screenplays
  }

  public getCurrentScreenplay(): Screenplay | null {
    return this.currentScreenplay
  }

  public setCurrentScreenplay(id: string): Screenplay | null {
    this.currentScreenplay = this.screenplays.find((s) => s.id === id) || null
    this.saveToStorage()
    return this.currentScreenplay
  }

  public addScene(sceneHeading: string): Scene {
    if (!this.currentScreenplay) throw new Error("No current screenplay")

    const scene: Scene = {
      id: Date.now().toString(),
      title: sceneHeading,
      content: "",
      sceneHeading,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.currentScreenplay.scenes.push(scene)
    this.currentScreenplay.updatedAt = new Date()
    this.saveToStorage()
    return scene
  }

  public updateScene(sceneId: string, content: string): void {
    if (!this.currentScreenplay) return

    const scene = this.currentScreenplay.scenes.find((s) => s.id === sceneId)
    if (scene) {
      scene.content = content
      scene.updatedAt = new Date()
      this.currentScreenplay.updatedAt = new Date()
      this.saveToStorage()
    }
  }

  public deleteScene(sceneId: string): void {
    if (!this.currentScreenplay) return

    this.currentScreenplay.scenes = this.currentScreenplay.scenes.filter((s) => s.id !== sceneId)
    this.currentScreenplay.updatedAt = new Date()
    this.saveToStorage()
  }

  public getSettings(): UserSettings {
    return this.settings
  }

  public updateSettings(newSettings: Partial<UserSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveToStorage()

    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }
    this.setupAutoSave()
  }
}

export default ScreenplayManager
