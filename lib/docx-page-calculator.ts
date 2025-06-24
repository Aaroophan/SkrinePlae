import { BlockType, type ScreenplayBlock } from "@/types/screenplay"
import { MeasurementUtils } from "./measurement-utils"
import type { TitlePageInfo } from "./title-page-generator"

export interface DocxPageBreakInfo {
    pageNumber: number
    blocks: ScreenplayBlock[]
    isTitlePage: boolean
    titleInfo?: TitlePageInfo
    usedHeight: number
    remainingHeight: number
    docxElements: DocxElement[]
}

export interface DocxElement {
    type: "paragraph" | "pageBreak" | "titleElement"
    blockId?: string
    content: string
    formatting: DocxFormatting
    spacing: DocxSpacing
    alignment?: "left" | "center" | "right"
    indent?: number
}

export interface DocxFormatting {
    bold?: boolean
    italic?: boolean
    fontSize: number
    fontFamily: string
    uppercase?: boolean
}

export interface DocxSpacing {
    before: number // in twips (1/20 of a point)
    after: number
    lineSpacing?: number
}

export class DocxPageCalculator {
    private readonly PAGE_HEIGHT_TWIPS = MeasurementUtils.mmToPt(MeasurementUtils.CONTENT_HEIGHT) * 20
    private readonly LINE_HEIGHT_TWIPS = MeasurementUtils.mmToPt(MeasurementUtils.LINE_HEIGHT_MM) * 20

    // DOCX-specific spacing in twips (1/20 of a point)
    private readonly blockSpacing = {
        [BlockType.SCENE_HEADING]: {
            before: MeasurementUtils.mmToPt(6) * 20,
            after: MeasurementUtils.mmToPt(6) * 20,
            fontSize: 24, // 12pt in half-points
            bold: true,
            uppercase: true,
            alignment: "left" as const,
        },
        [BlockType.ACTION]: {
            before: 0,
            after: MeasurementUtils.mmToPt(3) * 20,
            fontSize: 24,
            bold: false,
            uppercase: false,
            alignment: "left" as const,
        },
        [BlockType.CHARACTER]: {
            before: MeasurementUtils.mmToPt(6) * 20,
            after: 0,
            fontSize: 24,
            bold: true,
            uppercase: true,
            alignment: "center" as const,
        },
        [BlockType.DIALOGUE]: {
            before: 0,
            after: 0,
            fontSize: 24,
            bold: false,
            uppercase: false,
            alignment: "left" as const,
            indent: MeasurementUtils.mmToPt(30) * 20, // Left indent in twips
        },
        [BlockType.PARENTHETICAL]: {
            before: 0,
            after: 0,
            fontSize: 24,
            bold: false,
            uppercase: false,
            italic: true,
            alignment: "left" as const,
            indent: MeasurementUtils.mmToPt(40) * 20,
        },
        [BlockType.TRANSITION]: {
            before: MeasurementUtils.mmToPt(6) * 20,
            after: MeasurementUtils.mmToPt(12) * 20,
            fontSize: 24,
            bold: true,
            uppercase: true,
            alignment: "right" as const,
        },
    }

    calculateDocxElements(blocks: ScreenplayBlock[], titleInfo?: TitlePageInfo): DocxElement[] {
        const elements: DocxElement[] = []

        // Add title page elements if provided
        if (titleInfo && titleInfo.title) {
            elements.push(...this.createTitlePageElements(titleInfo))
            elements.push({
                type: "pageBreak",
                content: "",
                formatting: { fontSize: 24, fontFamily: "Courier New" },
                spacing: { before: 0, after: 0 },
            })
        }

        // Add screenplay content elements
        blocks.forEach((block) => {
            const spacing = this.blockSpacing[block.type]
            const element: DocxElement = {
                type: "paragraph",
                blockId: block.id,
                content: spacing.uppercase ? block.content.toUpperCase() : block.content,
                formatting: {
                    bold: spacing.bold,
                    italic: spacing.italic,
                    fontSize: spacing.fontSize,
                    fontFamily: "Courier New",
                    uppercase: spacing.uppercase,
                },
                spacing: {
                    before: spacing.before,
                    after: spacing.after,
                    lineSpacing: this.LINE_HEIGHT_TWIPS,
                },
                alignment: spacing.alignment,
                indent: spacing.indent,
            }
            elements.push(element)
        })

        return elements
    }

    private createTitlePageElements(titleInfo: TitlePageInfo): DocxElement[] {
        const elements: DocxElement[] = []

        // Title
        elements.push({
            type: "titleElement",
            content: titleInfo.title.toUpperCase(),
            formatting: {
                bold: true,
                fontSize: 36, // 18pt in half-points
                fontFamily: "Courier New",
                uppercase: true,
            },
            spacing: {
                before: MeasurementUtils.mmToPt(60) * 20, // Center vertically
                after: MeasurementUtils.mmToPt(10) * 20,
            },
            alignment: "center",
        })

        // Author
        if (titleInfo.author) {
            elements.push({
                type: "titleElement",
                content: `by ${titleInfo.author}`,
                formatting: {
                    fontSize: 28, // 14pt in half-points
                    fontFamily: "Courier New",
                },
                spacing: {
                    before: 0,
                    after: MeasurementUtils.mmToPt(20) * 20,
                },
                alignment: "center",
            })
        }

        // Description
        if (titleInfo.description) {
            elements.push({
                type: "titleElement",
                content: titleInfo.description,
                formatting: {
                    italic: true,
                    fontSize: 22, // 11pt in half-points
                    fontFamily: "Courier New",
                },
                spacing: {
                    before: MeasurementUtils.mmToPt(20) * 20,
                    after: MeasurementUtils.mmToPt(40) * 20,
                },
                alignment: "center",
            })
        }

        // Date (bottom right)
        const dateText = titleInfo.date || new Date().toLocaleDateString()
        elements.push({
            type: "titleElement",
            content: dateText,
            formatting: {
                fontSize: 20, // 10pt in half-points
                fontFamily: "Courier New",
            },
            spacing: {
                before: MeasurementUtils.mmToPt(100) * 20, // Push to bottom
                after: 0,
            },
            alignment: "right",
        })

        return elements
    }

    calculateDocxPageBreaks(elements: DocxElement[]): DocxPageBreakInfo[] {
        const pages: DocxPageBreakInfo[] = []
        let currentPageElements: DocxElement[] = []
        let currentPageHeight = 0
        let pageNumber = 1
        let isTitlePage = true

        for (const element of elements) {
            if (element.type === "pageBreak") {
                // Finish current page
                if (currentPageElements.length > 0) {
                    pages.push(this.createPageInfo(pageNumber, currentPageElements, currentPageHeight, isTitlePage))
                    pageNumber++
                    isTitlePage = false
                }

                // Reset for new page
                currentPageElements = []
                currentPageHeight = 0
                continue
            }

            const elementHeight = this.calculateElementHeight(element)

            // Check if element fits on current page
            if (currentPageHeight + elementHeight <= this.PAGE_HEIGHT_TWIPS) {
                currentPageElements.push(element)
                currentPageHeight += elementHeight
            } else {
                // Element doesn't fit, start new page
                if (currentPageElements.length > 0) {
                    pages.push(this.createPageInfo(pageNumber, currentPageElements, currentPageHeight, isTitlePage))
                    pageNumber++
                    isTitlePage = false
                }

                currentPageElements = [element]
                currentPageHeight = elementHeight
            }
        }

        // Add final page
        if (currentPageElements.length > 0) {
            pages.push(this.createPageInfo(pageNumber, currentPageElements, currentPageHeight, isTitlePage))
        }

        return pages
    }

    private calculateElementHeight(element: DocxElement): number {
        // Base height from font size and line spacing
        const baseHeight = element.formatting.fontSize + (element.spacing.lineSpacing || this.LINE_HEIGHT_TWIPS)

        // Add spacing before and after
        const totalHeight = baseHeight + element.spacing.before + element.spacing.after

        // Estimate multiple lines for long content
        if (element.content.length > 60) {
            const estimatedLines = Math.ceil(element.content.length / 60)
            return totalHeight * estimatedLines
        }

        return totalHeight
    }

    private createPageInfo(
        pageNumber: number,
        elements: DocxElement[],
        usedHeight: number,
        isTitlePage: boolean,
    ): DocxPageBreakInfo {
        // Extract screenplay blocks from elements
        const blocks: ScreenplayBlock[] = []
        let titleInfo: TitlePageInfo | undefined

        if (isTitlePage) {
            // Extract title info from title elements
            const titleElement = elements.find((e) => e.type === "titleElement" && e.formatting.fontSize === 36)
            const authorElement = elements.find((e) => e.type === "titleElement" && e.content.startsWith("by "))
            const descElement = elements.find((e) => e.type === "titleElement" && e.formatting.italic)

            if (titleElement) {
                titleInfo = {
                    title: titleElement.content,
                    author: authorElement?.content.replace("by ", ""),
                    description: descElement?.content,
                }
            }
        } else {
            // Extract screenplay blocks from paragraph elements
            elements
                .filter((e) => e.type === "paragraph" && e.blockId)
                .forEach((element) => {
                    // Find the original block type based on formatting
                    let blockType = BlockType.ACTION
                    if (element.formatting.bold && element.alignment === "center") {
                        blockType = BlockType.CHARACTER
                    } else if (element.formatting.bold && element.formatting.uppercase) {
                        blockType = BlockType.SCENE_HEADING
                    } else if (element.alignment === "right") {
                        blockType = BlockType.TRANSITION
                    } else if (element.formatting.italic) {
                        blockType = BlockType.PARENTHETICAL
                    } else if (element.indent && element.indent > 0) {
                        blockType = BlockType.DIALOGUE
                    }

                    blocks.push({
                        id: element.blockId!,
                        type: blockType,
                        content: element.content,
                    })
                })
        }

        return {
            pageNumber,
            blocks,
            isTitlePage,
            titleInfo,
            usedHeight: usedHeight / 20, // Convert twips to points
            remainingHeight: (this.PAGE_HEIGHT_TWIPS - usedHeight) / 20,
            docxElements: elements,
        }
    }

    validateDocxPageBreaks(pages: DocxPageBreakInfo[]): { isValid: boolean; issues: string[] } {
        const issues: string[] = []

        pages.forEach((page, index) => {
            if (page.usedHeight > MeasurementUtils.CONTENT_HEIGHT) {
                issues.push(
                    `Page ${page.pageNumber}: Content height ${page.usedHeight.toFixed(1)}pt exceeds page height ${MeasurementUtils.CONTENT_HEIGHT}mm`,
                )
            }

            if (page.remainingHeight < 0) {
                issues.push(`Page ${page.pageNumber}: Negative remaining height ${page.remainingHeight.toFixed(1)}pt`)
            }
        })

        return {
            isValid: issues.length === 0,
            issues,
        }
    }
}
