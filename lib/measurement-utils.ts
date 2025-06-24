// Unified measurement system for consistent UI and PDF rendering
export class MeasurementUtils {
    // Standard screenplay measurements in mm
    static readonly PAGE_WIDTH = 210 // A4 width
    static readonly PAGE_HEIGHT = 297 // A4 height
    static readonly MARGIN_TOP = 25
    static readonly MARGIN_BOTTOM = 25
    static readonly MARGIN_LEFT = 20
    static readonly MARGIN_RIGHT = 20
    static readonly CONTENT_WIDTH = this.PAGE_WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT
    static readonly CONTENT_HEIGHT = this.PAGE_HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM

    // Typography measurements
    static readonly FONT_SIZE_PT = 12
    static readonly LINE_HEIGHT_RATIO = 1.5
    static readonly LINE_HEIGHT_MM = this.FONT_SIZE_PT * this.LINE_HEIGHT_RATIO * 0.352778 // pt to mm conversion

    // Convert measurements
    static ptToMm(pt: number): number {
        return pt * 0.352778
    }

    static mmToPt(mm: number): number {
        return mm / 0.352778
    }

    static pxToMm(px: number, dpi = 96): number {
        return (px * 25.4) / dpi
    }

    static mmToPx(mm: number, dpi = 96): number {
        return (mm * dpi) / 25.4
    }

    // Calculate actual text dimensions
    static measureTextWidth(text: string, fontSize: number = this.FONT_SIZE_PT): number {
        // Courier New character width approximation (monospace)
        const avgCharWidthMm = this.ptToMm(fontSize * 0.6) // Courier New is ~0.6em wide per character
        return text.length * avgCharWidthMm
    }

    static calculateTextLines(text: string, maxWidthMm: number, fontSize: number = this.FONT_SIZE_PT): number {
        if (!text.trim()) return 1

        const words = text.split(/\s+/)
        let lines = 1
        let currentLineWidth = 0
        const spaceWidth = this.measureTextWidth(" ", fontSize)

        for (const word of words) {
            const wordWidth = this.measureTextWidth(word, fontSize)

            if (currentLineWidth + wordWidth + spaceWidth > maxWidthMm && currentLineWidth > 0) {
                lines++
                currentLineWidth = wordWidth
            } else {
                currentLineWidth += wordWidth + spaceWidth
            }
        }

        return lines
    }

    // Get CSS values that match PDF measurements
    static getCSSValues() {
        return {
            pageWidth: `${this.PAGE_WIDTH}mm`,
            pageHeight: `${this.PAGE_HEIGHT}mm`,
            marginTop: `${this.MARGIN_TOP}mm`,
            marginBottom: `${this.MARGIN_BOTTOM}mm`,
            marginLeft: `${this.MARGIN_LEFT}mm`,
            marginRight: `${this.MARGIN_RIGHT}mm`,
            contentWidth: `${this.CONTENT_WIDTH}mm`,
            contentHeight: `${this.CONTENT_HEIGHT}mm`,
            fontSize: `${this.FONT_SIZE_PT}pt`,
            lineHeight: this.LINE_HEIGHT_RATIO,
            lineHeightMm: `${this.LINE_HEIGHT_MM}mm`,
        }
    }
}
