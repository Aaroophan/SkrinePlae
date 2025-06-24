// Industry-standard screenplay formatting specifications
export class ScreenplayFormattingStandards {
    // Page dimensions (A4 converted to US Letter equivalent for screenplay standards)
    static readonly PAGE_WIDTH = 216 // mm (8.5 inches)
    static readonly PAGE_HEIGHT = 279 // mm (11 inches)

    // Standard margins in mm
    static readonly MARGIN_TOP = 25.4 // 1 inch
    static readonly MARGIN_BOTTOM = 25.4 // 1 inch
    static readonly MARGIN_LEFT = 38.1 // 1.5 inches
    static readonly MARGIN_RIGHT = 25.4 // 1 inch

    // Content area
    static readonly CONTENT_WIDTH = this.PAGE_WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT
    static readonly CONTENT_HEIGHT = this.PAGE_HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM

    // Typography standards
    static readonly FONT_FAMILY = "Courier New"
    static readonly FONT_SIZE = 12 // points
    static readonly LINE_HEIGHT = 12 // points (single spacing)
    static readonly CHARACTERS_PER_INCH = 10 // Courier New standard

    // Element positioning (from left margin in characters/inches)
    static readonly SCENE_HEADING = {
        leftMargin: 0, // Start at left margin
        rightMargin: 0, // Full width
        spacingBefore: 24, // 2 lines
        spacingAfter: 12, // 1 line
        uppercase: true,
        bold: false,
        underline: false,
    }

    static readonly ACTION = {
        leftMargin: 0, // Start at left margin
        rightMargin: 0, // Full width
        spacingBefore: 12, // 1 line
        spacingAfter: 12, // 1 line
        uppercase: false,
        bold: false,
        underline: false,
    }

    static readonly CHARACTER = {
        leftMargin: 22, // 2.2 inches from left margin
        rightMargin: 0,
        spacingBefore: 12, // 1 line
        spacingAfter: 0, // No space before dialogue
        uppercase: true,
        bold: false,
        underline: false,
    }

    static readonly DIALOGUE = {
        leftMargin: 10, // 1.0 inch from left margin
        rightMargin: 15, // 1.5 inches from right margin
        spacingBefore: 0, // No space after character
        spacingAfter: 12, // 1 line
        uppercase: false,
        bold: false,
        underline: false,
    }

    static readonly PARENTHETICAL = {
        leftMargin: 16, // 1.6 inches from left margin
        rightMargin: 20, // 2.0 inches from right margin
        spacingBefore: 0, // No space
        spacingAfter: 0, // No space
        uppercase: false,
        bold: false,
        underline: false,
    }

    static readonly TRANSITION = {
        leftMargin: 45, // Right-aligned, approximately 4.5 inches
        rightMargin: 0,
        spacingBefore: 12, // 1 line
        spacingAfter: 24, // 2 lines
        uppercase: true,
        bold: false,
        underline: false,
    }

    // Convert character positions to millimeters
    static getElementMargins(elementType: string) {
        const element = this[elementType as keyof typeof ScreenplayFormattingStandards] as any
        if (!element) return { left: 0, right: 0 }

        const charWidthMm = 25.4 / this.CHARACTERS_PER_INCH // mm per character

        return {
            left: element.leftMargin * charWidthMm,
            right: element.rightMargin * charWidthMm,
            spacingBefore: element.spacingBefore,
            spacingAfter: element.spacingAfter,
            width: this.CONTENT_WIDTH - element.leftMargin * charWidthMm - element.rightMargin * charWidthMm,
        }
    }

    // Get CSS values for precise formatting
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
            fontSize: `${this.FONT_SIZE}pt`,
            lineHeight: `${this.LINE_HEIGHT}pt`,
            fontFamily: this.FONT_FAMILY,
            charWidthMm: 25.4 / this.CHARACTERS_PER_INCH,
        }
    }
}
