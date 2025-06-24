import { BlockType, type ScreenplayBlock } from "@/types/screenplay"
import { MeasurementUtils } from "./measurement-utils"

export interface AccuratePageBreakInfo {
    pageNumber: number
    blocks: ScreenplayBlock[]
    usedHeight: number
    remainingHeight: number
    debugInfo?: {
        blockHeights: Array<{ blockId: string; height: number; type: BlockType }>
        totalCalculatedHeight: number
    }
}

export interface BlockDimensions {
    blockId: string
    type: BlockType
    content: string
    heightMm: number
    lineCount: number
    spacingBefore: number
    spacingAfter: number
    canBreakBefore: boolean
    mustKeepWithNext: boolean
}

export class AccuratePageCalculator {
    private readonly contentHeight = MeasurementUtils.CONTENT_HEIGHT
    private readonly lineHeight = MeasurementUtils.LINE_HEIGHT_MM

    // Precise spacing rules for each block type (in mm)
    private readonly blockSpacing = {
        [BlockType.SCENE_HEADING]: {
            before: 6,
            after: 6,
            minLines: 1,
            maxWidth: MeasurementUtils.CONTENT_WIDTH,
            canBreakBefore: true,
            mustKeepWithNext: false,
        },
        [BlockType.ACTION]: {
            before: 0,
            after: 3,
            minLines: 1,
            maxWidth: MeasurementUtils.CONTENT_WIDTH,
            canBreakBefore: true,
            mustKeepWithNext: false,
        },
        [BlockType.CHARACTER]: {
            before: 6,
            after: 0,
            minLines: 1,
            maxWidth: MeasurementUtils.CONTENT_WIDTH * 0.6, // Centered, shorter width
            canBreakBefore: true,
            mustKeepWithNext: true, // Keep with dialogue
        },
        [BlockType.DIALOGUE]: {
            before: 0,
            after: 0,
            minLines: 1,
            maxWidth: MeasurementUtils.CONTENT_WIDTH * 0.6, // Indented dialogue
            canBreakBefore: false, // Don't break from character
            mustKeepWithNext: false,
        },
        [BlockType.PARENTHETICAL]: {
            before: 0,
            after: 0,
            minLines: 1,
            maxWidth: MeasurementUtils.CONTENT_WIDTH * 0.5, // More indented
            canBreakBefore: false, // Keep with dialogue
            mustKeepWithNext: true, // Keep with following dialogue
        },
        [BlockType.TRANSITION]: {
            before: 6,
            after: 12,
            minLines: 1,
            maxWidth: MeasurementUtils.CONTENT_WIDTH,
            canBreakBefore: true,
            mustKeepWithNext: false,
        },
    }

    calculateBlockDimensions(block: ScreenplayBlock): BlockDimensions {
        const spacing = this.blockSpacing[block.type]
        const lineCount = MeasurementUtils.calculateTextLines(
            block.content || " ", // Ensure at least one line for empty blocks
            spacing.maxWidth,
        )

        const contentHeight = Math.max(lineCount, spacing.minLines) * this.lineHeight
        const totalHeight = contentHeight + spacing.before + spacing.after

        return {
            blockId: block.id,
            type: block.type,
            content: block.content,
            heightMm: totalHeight,
            lineCount,
            spacingBefore: spacing.before,
            spacingAfter: spacing.after,
            canBreakBefore: spacing.canBreakBefore,
            mustKeepWithNext: spacing.mustKeepWithNext,
        }
    }

    findKeepTogetherGroup(blocks: BlockDimensions[], startIndex: number): BlockDimensions[] {
        const group = [blocks[startIndex]]
        let currentIndex = startIndex

        // Look forward for blocks that must be kept together
        while (currentIndex < blocks.length - 1 && blocks[currentIndex].mustKeepWithNext) {
            currentIndex++
            group.push(blocks[currentIndex])
        }

        return group
    }

    calculateGroupHeight(blocks: BlockDimensions[]): number {
        return blocks.reduce((total, block) => total + block.heightMm, 0)
    }

    calculateAccuratePageBreaks(screenplayBlocks: ScreenplayBlock[], debug = false): AccuratePageBreakInfo[] {
        const blockDimensions = screenplayBlocks.map((block) => this.calculateBlockDimensions(block))
        const pages: AccuratePageBreakInfo[] = []

        let currentPageBlocks: ScreenplayBlock[] = []
        let currentPageHeight = 0
        let pageNumber = 1
        let blockIndex = 0

        const debugInfo = debug
            ? {
                blockHeights: [] as Array<{ blockId: string; height: number; type: BlockType }>,
                totalCalculatedHeight: 0,
            }
            : undefined

        while (blockIndex < blockDimensions.length) {
            const currentBlock = blockDimensions[blockIndex]

            // Check if this block must be kept with following blocks
            const keepTogetherGroup = this.findKeepTogetherGroup(blockDimensions, blockIndex)
            const groupHeight = this.calculateGroupHeight(keepTogetherGroup)

            if (debug && debugInfo) {
                keepTogetherGroup.forEach((block) => {
                    debugInfo.blockHeights.push({
                        blockId: block.blockId,
                        height: block.heightMm,
                        type: block.type,
                    })
                })
            }

            // Check if group fits on current page
            if (currentPageHeight + groupHeight <= this.contentHeight) {
                // Group fits, add to current page
                keepTogetherGroup.forEach((blockDim) => {
                    const originalBlock = screenplayBlocks.find((b) => b.id === blockDim.blockId)!
                    currentPageBlocks.push(originalBlock)
                })
                currentPageHeight += groupHeight
                blockIndex += keepTogetherGroup.length
            } else {
                // Group doesn't fit, finish current page if it has content
                if (currentPageBlocks.length > 0) {
                    pages.push({
                        pageNumber,
                        blocks: [...currentPageBlocks],
                        usedHeight: currentPageHeight,
                        remainingHeight: this.contentHeight - currentPageHeight,
                        debugInfo: debug ? { ...debugInfo } : undefined,
                    })
                    pageNumber++

                    // Reset for new page
                    currentPageBlocks = []
                    currentPageHeight = 0

                    if (debug && debugInfo) {
                        debugInfo.totalCalculatedHeight += currentPageHeight
                        debugInfo.blockHeights = []
                    }
                }

                // Check if group fits on a new page
                if (groupHeight <= this.contentHeight) {
                    // Group fits on new page
                    keepTogetherGroup.forEach((blockDim) => {
                        const originalBlock = screenplayBlocks.find((b) => b.id === blockDim.blockId)!
                        currentPageBlocks.push(originalBlock)
                    })
                    currentPageHeight += groupHeight
                    blockIndex += keepTogetherGroup.length
                } else {
                    // Group is too large for any page - split it (fallback)
                    console.warn(`Block group too large for page: ${groupHeight}mm > ${this.contentHeight}mm`)

                    // Add blocks one by one, breaking the keep-together rule
                    for (const blockDim of keepTogetherGroup) {
                        if (currentPageHeight + blockDim.heightMm <= this.contentHeight) {
                            const originalBlock = screenplayBlocks.find((b) => b.id === blockDim.blockId)!
                            currentPageBlocks.push(originalBlock)
                            currentPageHeight += blockDim.heightMm
                        } else {
                            // Start new page
                            if (currentPageBlocks.length > 0) {
                                pages.push({
                                    pageNumber,
                                    blocks: [...currentPageBlocks],
                                    usedHeight: currentPageHeight,
                                    remainingHeight: this.contentHeight - currentPageHeight,
                                    debugInfo: debug ? { ...debugInfo } : undefined,
                                })
                                pageNumber++
                            }

                            const originalBlock = screenplayBlocks.find((b) => b.id === blockDim.blockId)!
                            currentPageBlocks = [originalBlock]
                            currentPageHeight = blockDim.heightMm
                        }
                    }
                    blockIndex += keepTogetherGroup.length
                }
            }
        }

        // Add final page if it has content
        if (currentPageBlocks.length > 0) {
            pages.push({
                pageNumber,
                blocks: currentPageBlocks,
                usedHeight: currentPageHeight,
                remainingHeight: this.contentHeight - currentPageHeight,
                debugInfo: debug ? { ...debugInfo } : undefined,
            })
        }

        return pages
    }

    // Validate page breaks by checking if content would overflow
    validatePageBreaks(pages: AccuratePageBreakInfo[]): { isValid: boolean; issues: string[] } {
        const issues: string[] = []

        pages.forEach((page, index) => {
            if (page.usedHeight > this.contentHeight) {
                issues.push(
                    `Page ${page.pageNumber}: Content height ${page.usedHeight.toFixed(1)}mm exceeds page height ${this.contentHeight}mm`,
                )
            }

            if (page.remainingHeight < 0) {
                issues.push(`Page ${page.pageNumber}: Negative remaining height ${page.remainingHeight.toFixed(1)}mm`)
            }

            if (page.blocks.length === 0) {
                issues.push(`Page ${page.pageNumber}: Empty page`)
            }
        })

        return {
            isValid: issues.length === 0,
            issues,
        }
    }
}
