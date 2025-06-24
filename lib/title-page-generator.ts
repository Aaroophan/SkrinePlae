import { MeasurementUtils } from "./measurement-utils"

export interface TitlePageInfo {
    title: string
    author?: string
    description?: string
    contact?: string
    date?: string
}

export interface TitlePageLayout {
    titleY: number
    authorY: number
    descriptionY: number
    contactY: number
    dateY: number
}

export class TitlePageGenerator {
    private readonly contentHeight = MeasurementUtils.CONTENT_HEIGHT
    private readonly contentWidth = MeasurementUtils.CONTENT_WIDTH
    private readonly lineHeight = MeasurementUtils.LINE_HEIGHT_MM

    calculateTitlePageLayout(titleInfo: TitlePageInfo): TitlePageLayout {
        // Center the title block vertically on the page
        const centerY = this.contentHeight / 2

        // Calculate spacing between elements
        const titleSpacing = this.lineHeight * 3
        const authorSpacing = this.lineHeight * 2
        const descriptionSpacing = this.lineHeight * 4
        const contactSpacing = this.lineHeight * 2

        // Start from center and work outward
        const currentY = centerY - (titleSpacing + authorSpacing) / 2

        const layout: TitlePageLayout = {
            titleY: currentY,
            authorY: currentY + titleSpacing,
            descriptionY: currentY + titleSpacing + authorSpacing + descriptionSpacing,
            contactY: this.contentHeight - 40, // Near bottom
            dateY: this.contentHeight - 20, // Bottom right
        }

        return layout
    }

    getTitlePageHeight(): number {
        // Title page always takes full page height
        return this.contentHeight
    }

    validateTitleInfo(titleInfo: TitlePageInfo): { isValid: boolean; issues: string[] } {
        const issues: string[] = []

        if (!titleInfo.title || titleInfo.title.trim().length === 0) {
            issues.push("Title is required for title page")
        }

        if (titleInfo.title && titleInfo.title.length > 100) {
            issues.push("Title is too long (max 100 characters)")
        }

        if (titleInfo.author && titleInfo.author.length > 80) {
            issues.push("Author name is too long (max 80 characters)")
        }

        if (titleInfo.description && titleInfo.description.length > 500) {
            issues.push("Description is too long (max 500 characters)")
        }

        return {
            isValid: issues.length === 0,
            issues,
        }
    }

    formatTitleForDisplay(title: string): string {
        return title.toUpperCase()
    }

    formatAuthorForDisplay(author: string): string {
        return `by ${author}`
    }

    formatDateForDisplay(date?: string): string {
        if (date) {
            return date
        }
        return new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }
}
