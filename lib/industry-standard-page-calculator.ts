import { BlockType, type ScreenplayBlock } from "@/types/screenplay"
import { ScreenplayFormattingStandards } from "./screenplay-formatting-standards"

export interface IndustryStandardPageBreakInfo {
    pageNumber: number
    blocks: ScreenplayBlock[]
    usedHeight: number
    remainingHeight: number
    debugInfo?: {
        blockHeights: Array<{ blockId: string; height: number; type: BlockType; formatting: any }>
        totalCalculatedHeight: number
    }
}

export interface IndustryBlockDimensions {
    blockId: string
    type: BlockType
    content: string
    heightPt: number
    lineCount: number
    spacingBefore: number
    spacingAfter: number
    formatting: any
    canBreakBefore: boolean
    mustKeepWithNext: boolean
}

export class IndustryStandardPageCalculator {
    private readonly contentHeightPt = ScreenplayFormattingStandards.CONTENT_HEIGHT * 2.834645669 // mm to pt conversion
    private readonly lineHeightPt = ScreenplayFormattingStandards.LINE_HEIGHT

    // Industry-standard keep-together rules
    private readonly keepTogetherRules = {
        [BlockType.SCENE_HEADING]: {
            canBreakBefore: true,
            mustKeepWithNext: false,
            orphanControl: 2, // Keep at least 2 lines with following content
        },
        [BlockType.ACTION]: {
            canBreakBefore: true,
            mustKeepWithNext: false,
            orphanControl: 1,
        },
        [BlockType.CHARACTER]: {
            canBreakBefore: true,
            mustKeepWithNext: true, // Always keep with dialogue
            orphanControl: 1,
        },
        [BlockType.DIALOGUE]: {
            canBreakBefore: false, // Never break from character
            mustKeepWithNext: false,
            orphanControl: 2, // Keep at least 2 lines together
        },
        [BlockType.PARENTHETICAL]: {
            canBreakBefore: false, // Keep with surrounding dialogue
            mustKeepWithNext: true, // Keep with following dialogue
            orphanControl: 1,
        },
        [BlockType.TRANSITION]: {
            canBreakBefore: true,
            mustKeepWithNext: false,
            orphanControl: 1,
        },
    }

    calculateIndustryBlockDimensions(block: ScreenplayBlock): IndustryBlockDimensions {
        const formatting = ScreenplayFormattingStandards.getElementMargins(block.type.toUpperCase())
        const rules = this.keepTogetherRules[block.type]

        // Calculate line count based on content and available width
        const lineCount = this.calculateLineCount(block.content, formatting.width, block.type)

        // Calculate total height including spacing
        const contentHeight = lineCount * this.lineHeightPt
        const totalHeight = contentHeight + formatting.spacingBefore + formatting.spacingAfter

        return {
            blockId: block.id,
            type: block.type,
            content: block.content,
            heightPt: totalHeight,
            lineCount,
            spacingBefore: formatting.spacingBefore,
            spacingAfter: formatting.spacingAfter,
            formatting,
            canBreakBefore: rules.canBreakBefore,
            mustKeepWithNext: rules.mustKeepWithNext,
        }
    }

    private calculateLineCount(content: string, widthMm: number, blockType: BlockType): number {
        if (!content.trim()) return 1

        const charWidthMm = ScreenplayFormattingStandards.getCSSValues().charWidthMm
        const charactersPerLine = Math.floor(widthMm / charWidthMm)

        // Handle different block types
        switch (blockType) {
            case BlockType.SCENE_HEADING:
                // Scene headings typically don't wrap much
                return Math.max(1, Math.ceil(content.length / charactersPerLine))

            case BlockType.ACTION:
                // Action lines wrap normally
                const words = content.split(/\s+/)
                let lines = 1
                let currentLineLength = 0

                for (const word of words) {
                    if (currentLineLength + word.length + 1 > charactersPerLine && currentLineLength > 0) {
                        lines++
                        currentLineLength = word.length
                    } else {
                        currentLineLength += word.length + (currentLineLength > 0 ? 1 : 0)
                    }
                }
                return lines

            case BlockType.CHARACTER:
                // Character names are typically single line
                return 1

            case BlockType.DIALOGUE:
                // Dialogue has narrower width, more wrapping
                return Math.max(1, Math.ceil(content.length / (charactersPerLine * 0.8)))

            case BlockType.PARENTHETICAL:
                // Parentheticals are usually short
                return Math.max(1, Math.ceil(content.length / (charactersPerLine * 0.7)))

            case BlockType.TRANSITION:
                // Transitions are typically single line
                return 1

            default:
                return Math.max(1, Math.ceil(content.length / charactersPerLine))
        }
    }

    findIndustryKeepTogetherGroup(blocks: IndustryBlockDimensions[], startIndex: number): IndustryBlockDimensions[] {
        const group = [blocks[startIndex]]
        let currentIndex = startIndex

        // Look forward for blocks that must be kept together
        while (currentIndex < blocks.length - 1 && blocks[currentIndex].mustKeepWithNext) {
            currentIndex++
            group.push(blocks[currentIndex])
        }

        return group
    }

    calculateGroupHeight(blocks: IndustryBlockDimensions[]): number {
        return blocks.reduce((total, block) => total + block.heightPt, 0)
    }

    calculateIndustryStandardPageBreaks(
        screenplayBlocks: ScreenplayBlock[],
        debug = false,
    ): IndustryStandardPageBreakInfo[] {
        const blockDimensions = screenplayBlocks.map((block) => this.calculateIndustryBlockDimensions(block))
        const pages: IndustryStandardPageBreakInfo[] = []

        let currentPageBlocks: ScreenplayBlock[] = []
        let currentPageHeight = 0
        let pageNumber = 1
        let blockIndex = 0

        const debugInfo = debug
            ? {
                blockHeights: [] as Array<{ blockId: string; height: number; type: BlockType; formatting: any }>,
                totalCalculatedHeight: 0,
            }
            : undefined

        while (blockIndex < blockDimensions.length) {
            const currentBlock = blockDimensions[blockIndex]

            // Check if this block must be kept with following blocks
            const keepTogetherGroup = this.findIndustryKeepTogetherGroup(blockDimensions, blockIndex)
            const groupHeight = this.calculateGroupHeight(keepTogetherGroup)

            if (debug && debugInfo) {
                keepTogetherGroup.forEach((block) => {
                    debugInfo.blockHeights.push({
                        blockId: block.blockId,
                        height: block.heightPt,
                        type: block.type,
                        formatting: block.formatting,
                    })
                })
            }

            // Check if group fits on current page
            if (currentPageHeight + groupHeight <= this.contentHeightPt) {
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
                        remainingHeight: this.contentHeightPt - currentPageHeight,
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
                if (groupHeight <= this.contentHeightPt) {
                    // Group fits on new page
                    keepTogetherGroup.forEach((blockDim) => {
                        const originalBlock = screenplayBlocks.find((b) => b.id === blockDim.blockId)!
                        currentPageBlocks.push(originalBlock)
                    })
                    currentPageHeight += groupHeight
                    blockIndex += keepTogetherGroup.length
                } else {
                    // Group is too large for any page - apply industry-standard breaking rules
                    console.warn(`Block group too large for page: ${groupHeight}pt > ${this.contentHeightPt}pt`)

                    // Break the group intelligently
                    for (const blockDim of keepTogetherGroup) {
                        if (currentPageHeight + blockDim.heightPt <= this.contentHeightPt) {
                            const originalBlock = screenplayBlocks.find((b) => b.id === blockDim.blockId)!
                            currentPageBlocks.push(originalBlock)
                            currentPageHeight += blockDim.heightPt
                        } else {
                            // Start new page
                            if (currentPageBlocks.length > 0) {
                                pages.push({
                                    pageNumber,
                                    blocks: [...currentPageBlocks],
                                    usedHeight: currentPageHeight,
                                    remainingHeight: this.contentHeightPt - currentPageHeight,
                                    debugInfo: debug ? { ...debugInfo } : undefined,
                                })
                                pageNumber++
                            }

                            const originalBlock = screenplayBlocks.find((b) => b.id === blockDim.blockId)!
                            currentPageBlocks = [originalBlock]
                            currentPageHeight = blockDim.heightPt
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
                remainingHeight: this.contentHeightPt - currentPageHeight,
                debugInfo: debug ? { ...debugInfo } : undefined,
            })
        }

        return pages
    }

    // Validate page breaks according to industry standards
    validateIndustryPageBreaks(pages: IndustryStandardPageBreakInfo[]): { isValid: boolean; issues: string[] } {
        const issues: string[] = []

        pages.forEach((page, index) => {
            if (page.usedHeight > this.contentHeightPt) {
                issues.push(
                    `Page ${page.pageNumber}: Content height ${page.usedHeight.toFixed(1)}pt exceeds industry standard page height ${this.contentHeightPt.toFixed(1)}pt`,
                )
            }

            if (page.remainingHeight < 0) {
                issues.push(`Page ${page.pageNumber}: Negative remaining height ${page.remainingHeight.toFixed(1)}pt`)
            }

            if (page.blocks.length === 0) {
                issues.push(`Page ${page.pageNumber}: Empty page`)
            }

            // Check for industry-standard violations
            page.blocks.forEach((block, blockIndex) => {
                if (block.type === BlockType.CHARACTER && blockIndex === page.blocks.length - 1) {
                    issues.push(`Page ${page.pageNumber}: Character name orphaned at bottom of page`)
                }

                if (block.type === BlockType.SCENE_HEADING && blockIndex > page.blocks.length - 3) {
                    issues.push(`Page ${page.pageNumber}: Scene heading near bottom of page (orphan control)`)
                }
            })
        })

        return {
            isValid: issues.length === 0,
            issues,
        }
    }
}
