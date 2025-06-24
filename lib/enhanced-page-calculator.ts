import type { ScreenplayBlock } from "@/types/screenplay"
import { AccuratePageCalculator, type AccuratePageBreakInfo } from "./accurate-page-calculator"
import { TitlePageGenerator, type TitlePageInfo } from "./title-page-generator"

export interface EnhancedPageBreakInfo extends AccuratePageBreakInfo {
    isTitlePage: boolean
    titleInfo?: TitlePageInfo
}

export class EnhancedPageCalculator extends AccuratePageCalculator {
    private titleGenerator = new TitlePageGenerator()

    calculatePagesWithTitlePage(
        screenplayBlocks: ScreenplayBlock[],
        titleInfo: TitlePageInfo,
        debug = false,
    ): EnhancedPageBreakInfo[] {
        const pages: EnhancedPageBreakInfo[] = []

        // Validate title info
        const titleValidation = this.titleGenerator.validateTitleInfo(titleInfo)
        if (!titleValidation.isValid) {
            console.warn("Title page validation issues:", titleValidation.issues)
        }

        // Add title page as page 1
        pages.push({
            pageNumber: 1,
            blocks: [], // Title page has no screenplay blocks
            usedHeight: this.titleGenerator.getTitlePageHeight(),
            remainingHeight: 0, // Title page uses full height
            isTitlePage: true,
            titleInfo: titleInfo,
            debugInfo: debug
                ? {
                    blockHeights: [],
                    totalCalculatedHeight: this.titleGenerator.getTitlePageHeight(),
                }
                : undefined,
        })

        // Calculate regular screenplay pages starting from page 2
        const contentPages = this.calculateAccuratePageBreaks(screenplayBlocks, debug)

        // Add content pages with adjusted page numbers
        contentPages.forEach((page) => {
            pages.push({
                ...page,
                pageNumber: page.pageNumber + 1, // Offset by 1 for title page
                isTitlePage: false,
            })
        })

        return pages
    }

    shouldIncludeTitlePage(titleInfo: TitlePageInfo): boolean {
        return !!(titleInfo.title && titleInfo.title.trim().length > 0)
    }

    getTotalPageCount(screenplayBlocks: ScreenplayBlock[], titleInfo: TitlePageInfo): number {
        if (this.shouldIncludeTitlePage(titleInfo)) {
            const contentPages = this.calculateAccuratePageBreaks(screenplayBlocks)
            return contentPages.length + 1 // +1 for title page
        } else {
            const contentPages = this.calculateAccuratePageBreaks(screenplayBlocks)
            return contentPages.length
        }
    }

    validateEnhancedPageBreaks(pages: EnhancedPageBreakInfo[]): { isValid: boolean; issues: string[] } {
        const issues: string[] = []

        // Check for title page
        const titlePage = pages.find((p) => p.isTitlePage)
        if (!titlePage) {
            issues.push("No title page found")
        } else {
            if (titlePage.pageNumber !== 1) {
                issues.push(`Title page should be page 1, found page ${titlePage.pageNumber}`)
            }
            if (titlePage.blocks.length > 0) {
                issues.push("Title page should not contain screenplay blocks")
            }
        }

        // Check content pages
        const contentPages = pages.filter((p) => !p.isTitlePage)
        if (contentPages.length === 0) {
            issues.push("No content pages found")
        } else {
            // Validate page numbering
            contentPages.forEach((page, index) => {
                const expectedPageNumber = index + 2 // Start from page 2
                if (page.pageNumber !== expectedPageNumber) {
                    issues.push(
                        `Content page ${index + 1} has incorrect page number: ${page.pageNumber}, expected ${expectedPageNumber}`,
                    )
                }
            })
        }

        // Run standard validation on content pages
        const standardValidation = this.validatePageBreaks(contentPages)
        issues.push(...standardValidation.issues)

        return {
            isValid: issues.length === 0,
            issues,
        }
    }
}
