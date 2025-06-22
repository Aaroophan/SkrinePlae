export type ScreenplayElementType =
    | "SCENE_HEADING"
    | "CHARACTER"
    | "DIALOGUE"
    | "PARENTHETICAL"
    | "ACTION"
    | "TRANSITION"
    | "TITLE"
    | "FADE_IN"
    | "FADE_OUT"

export interface ScreenplayElement {
    type: ScreenplayElementType
    content: string
    indent: number
}

export class ScreenplayFormatter {
    private static readonly SCENE_HEADING_PATTERNS = [/^(INT\.|EXT\.|FADE IN:|FADE OUT:)/i, /^(INTERIOR|EXTERIOR)/i]

    private static readonly CHARACTER_PATTERN = /^[A-Z][A-Z\s]{1,}$/
    private static readonly PARENTHETICAL_PATTERN = /^$$.+$$$/
    private static readonly TRANSITION_PATTERNS = [/^(CUT TO:|DISSOLVE TO:|FADE TO:|SMASH CUT TO:)/i, /^FADE OUT\.?$/i]

    public static detectElementType(line: string): ScreenplayElementType {
        const trimmed = line.trim()

        if (!trimmed) return "ACTION"

        // Scene headings
        if (this.SCENE_HEADING_PATTERNS.some((pattern) => pattern.test(trimmed))) {
            return "SCENE_HEADING"
        }

        // Transitions
        if (this.TRANSITION_PATTERNS.some((pattern) => pattern.test(trimmed))) {
            return "TRANSITION"
        }

        // Parentheticals
        if (this.PARENTHETICAL_PATTERN.test(trimmed)) {
            return "PARENTHETICAL"
        }

        // Character names (all caps, reasonable length)
        if (this.CHARACTER_PATTERN.test(trimmed) && trimmed.length < 30 && !trimmed.includes(".")) {
            return "CHARACTER"
        }

        // Default to action
        return "ACTION"
    }

    public static formatElement(content: string, type: ScreenplayElementType): ScreenplayElement {
        const trimmed = content.trim()

        switch (type) {
            case "SCENE_HEADING":
                return {
                    type,
                    content: trimmed.toUpperCase(),
                    indent: 0,
                }

            case "CHARACTER":
                return {
                    type,
                    content: trimmed.toUpperCase(),
                    indent: 20, // Character names are indented
                }

            case "DIALOGUE":
                return {
                    type,
                    content: trimmed,
                    indent: 10, // Dialogue is slightly indented
                }

            case "PARENTHETICAL":
                return {
                    type,
                    content: trimmed,
                    indent: 15, // Parentheticals are centered-ish
                }

            case "TRANSITION":
                return {
                    type,
                    content: trimmed.toUpperCase(),
                    indent: 45, // Transitions are right-aligned
                }

            case "ACTION":
            default:
                return {
                    type,
                    content: trimmed,
                    indent: 0,
                }
        }
    }

    public static processLine(line: string, previousType?: ScreenplayElementType): ScreenplayElement {
        const detectedType = this.detectElementType(line)

        // Smart context-aware formatting
        if (previousType === "CHARACTER" && detectedType === "ACTION" && line.trim()) {
            // If previous line was character and this isn't empty, it's probably dialogue
            return this.formatElement(line, "DIALOGUE")
        }

        return this.formatElement(line, detectedType)
    }

    public static handleSmartCommand(command: string): ScreenplayElement | null {
        const cmd = command.toLowerCase().replace("/", "")

        switch (cmd) {
            case "scene":
            case "int":
            case "ext":
                return this.formatElement("INT. LOCATION - DAY", "SCENE_HEADING")

            case "character":
            case "char":
                return this.formatElement("CHARACTER NAME", "CHARACTER")

            case "dialogue":
            case "dialog":
                return this.formatElement("", "DIALOGUE")

            case "action":
                return this.formatElement("", "ACTION")

            case "parenthetical":
            case "paren":
                return this.formatElement("()", "PARENTHETICAL")

            case "transition":
            case "cut":
                return this.formatElement("CUT TO:", "TRANSITION")

            case "fade":
                return this.formatElement("FADE IN:", "SCENE_HEADING")

            default:
                return null
        }
    }

    public static getNextElementType(currentType: ScreenplayElementType): ScreenplayElementType {
        const cycle: ScreenplayElementType[] = ["ACTION", "CHARACTER", "DIALOGUE", "ACTION"]
        const currentIndex = cycle.indexOf(currentType)
        return cycle[(currentIndex + 1) % cycle.length]
    }
}
