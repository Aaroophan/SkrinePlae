import { BlockType, type ScreenplayBlock } from "@/types/screenplay"

export interface PageBreakInfo {
    pageNumber: number
    blocks: ScreenplayBlock[]
    remainingHeight: number
}

export interface BlockMeasurement {
    blockId: string
    height: number
    canBreak: boolean
    keepWithNext?: boolean
}

export class PageBreakCalculator {
    private readonly PAGE_HEIGHT = 247 // mm (A4 height minus margins)
    private readonly LINE_HEIGHT = 4.5 // mm (12pt with 1.5 line spacing)
    private readonly BLOCK_SPACING = {
        [BlockType.SCENE_HEADING]: { before: 6, after: 6, minLines: 1 },
        [BlockType.ACTION]: { before: 0, after: 3, minLines: 1 },
        [BlockType.CHARACTER]: { before: 6, after: 0, minLines: 1 },
        [BlockType.DIALOGUE]: { before: 0, after: 0, minLines: 1 },
        [BlockType.PARENTHETICAL]: { before: 0, after: 0, minLines: 1 },
        [BlockType.TRANSITION]: { before: 6, after: 12, minLines: 1 },
    }

    calculateBlockHeight(block: ScreenplayBlock): number {
        const spacing = this.BLOCK_SPACING[block.type]
        const contentLines = this.calculateContentLines(block)
        const contentHeight = contentLines * this.LINE_HEIGHT
        const spacingHeight = spacing.before + spacing.after

        return contentHeight + spacingHeight
    }

    private calculateContentLines(block: ScreenplayBlock): number {
        if (!block.content.trim()) return 1

        // Estimate lines based on block type and content length
        switch (block.type) {
            case BlockType.SCENE_HEADING:
                return Math.max(1, Math.ceil(block.content.length / 60))
            case BlockType.ACTION:
                return Math.max(1, Math.ceil(block.content.length / 65))
            case BlockType.CHARACTER:
                return 1
            case BlockType.DIALOGUE:
                return Math.max(1, Math.ceil(block.content.length / 35))
            case BlockType.PARENTHETICAL:
                return 1
            case BlockType.TRANSITION:
                return 1
            default:
                return Math.max(1, Math.ceil(block.content.length / 65))
        }
    }

    canBlockFitOnPage(block: ScreenplayBlock, remainingHeight: number): boolean {
        const blockHeight = this.calculateBlockHeight(block)
        return blockHeight <= remainingHeight
    }

    shouldKeepBlocksTogether(currentBlock: ScreenplayBlock, nextBlock?: ScreenplayBlock): boolean {
        if (!nextBlock) return false

        // Keep CHARACTER with DIALOGUE
        if (currentBlock.type === BlockType.CHARACTER && nextBlock.type === BlockType.DIALOGUE) {
            return true
        }

        // Keep PARENTHETICAL with DIALOGUE
        if (currentBlock.type === BlockType.PARENTHETICAL && nextBlock.type === BlockType.DIALOGUE) {
            return true
        }

        // Keep DIALOGUE with PARENTHETICAL
        if (currentBlock.type === BlockType.DIALOGUE && nextBlock.type === BlockType.PARENTHETICAL) {
            return true
        }

        return false
    }

    calculatePageBreaks(blocks: ScreenplayBlock[]): PageBreakInfo[] {
        const pages: PageBreakInfo[] = []
        let currentPageBlocks: ScreenplayBlock[] = []
        let currentPageHeight = 0
        let pageNumber = 1

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i]
            const nextBlock = blocks[i + 1]
            const blockHeight = this.calculateBlockHeight(block)

            // Check if block fits on current page
            if (currentPageHeight + blockHeight <= this.PAGE_HEIGHT) {
                // Block fits, add to current page
                currentPageBlocks.push(block)
                currentPageHeight += blockHeight
            } else {
                // Block doesn't fit, check if we should keep blocks together
                const shouldKeepTogether = this.shouldKeepBlocksTogether(currentPageBlocks[currentPageBlocks.length - 1], block)

                if (shouldKeepTogether && currentPageBlocks.length > 0) {
                    // Move the last block to next page with current block
                    const lastBlock = currentPageBlocks.pop()!
                    const lastBlockHeight = this.calculateBlockHeight(lastBlock)
                    currentPageHeight -= lastBlockHeight

                    // Finish current page
                    if (currentPageBlocks.length > 0) {
                        pages.push({
                            pageNumber,
                            blocks: [...currentPageBlocks],
                            remainingHeight: this.PAGE_HEIGHT - currentPageHeight,
                        })
                        pageNumber++
                    }

                    // Start new page with both blocks
                    currentPageBlocks = [lastBlock, block]
                    currentPageHeight = lastBlockHeight + blockHeight
                } else {
                    // Finish current page
                    if (currentPageBlocks.length > 0) {
                        pages.push({
                            pageNumber,
                            blocks: [...currentPageBlocks],
                            remainingHeight: this.PAGE_HEIGHT - currentPageHeight,
                        })
                        pageNumber++
                    }

                    // Start new page with current block
                    currentPageBlocks = [block]
                    currentPageHeight = blockHeight
                }
            }

            // Handle very long blocks that exceed page height
            if (blockHeight > this.PAGE_HEIGHT) {
                // For now, just put it on its own page
                // In a more sophisticated implementation, we could split the block content
                if (currentPageBlocks.length === 1 && currentPageBlocks[0].id === block.id) {
                    pages.push({
                        pageNumber,
                        blocks: [...currentPageBlocks],
                        remainingHeight: Math.max(0, this.PAGE_HEIGHT - currentPageHeight),
                    })
                    pageNumber++
                    currentPageBlocks = []
                    currentPageHeight = 0
                }
            }
        }

        // Add remaining blocks to final page
        if (currentPageBlocks.length > 0) {
            pages.push({
                pageNumber,
                blocks: currentPageBlocks,
                remainingHeight: this.PAGE_HEIGHT - currentPageHeight,
            })
        }

        return pages
    }

    getOptimalPageBreakPoint(blocks: ScreenplayBlock[], maxHeight: number): number {
        let currentHeight = 0
        let lastGoodBreakPoint = 0

        for (let i = 0; i < blocks.length; i++) {
            const blockHeight = this.calculateBlockHeight(blocks[i])

            if (currentHeight + blockHeight > maxHeight) {
                return lastGoodBreakPoint
            }

            currentHeight += blockHeight

            // Update break point based on block type
            if (this.isGoodBreakPoint(blocks[i], blocks[i + 1])) {
                lastGoodBreakPoint = i + 1
            }
        }

        return blocks.length
    }

    private isGoodBreakPoint(currentBlock: ScreenplayBlock, nextBlock?: ScreenplayBlock): boolean {
        if (!nextBlock) return true

        // Good break points
        if (currentBlock.type === BlockType.SCENE_HEADING) return false // Don't break after scene heading
        if (currentBlock.type === BlockType.CHARACTER) return false // Don't break after character name
        if (currentBlock.type === BlockType.PARENTHETICAL) return false // Don't break after parenthetical
        if (currentBlock.type === BlockType.ACTION && nextBlock.type === BlockType.CHARACTER) return true
        if (currentBlock.type === BlockType.DIALOGUE && nextBlock.type === BlockType.SCENE_HEADING) return true
        if (currentBlock.type === BlockType.TRANSITION) return true

        return true
    }
}
