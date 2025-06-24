"use client"

import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { ScreenplayFormattingStandards } from "@/lib/screenplay-formatting-standards"

interface ScreenplayPageProps {
    children: React.ReactNode
    pageNumber: number
    isLastPage?: boolean
    usedHeight?: number
    remainingHeight?: number
    className?: string
    showDebugInfo?: boolean
}

export const ScreenplayPage = forwardRef<HTMLDivElement, ScreenplayPageProps>(
    (
        { children, pageNumber, isLastPage = false, usedHeight, remainingHeight, className, showDebugInfo = false },
        ref,
    ) => {
        const cssValues = ScreenplayFormattingStandards.getCSSValues()

        return (
            <div className="relative mb-8">
                {/* Debug info */}
                {showDebugInfo && (usedHeight !== undefined || remainingHeight !== undefined) && (
                    <div className="mb-2 text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <div>Page {pageNumber} Debug (Industry Standard):</div>
                        {usedHeight !== undefined && <div>Used: {usedHeight.toFixed(1)}pt</div>}
                        {remainingHeight !== undefined && <div>Remaining: {remainingHeight.toFixed(1)}pt</div>}
                        <div>Content Height: {ScreenplayFormattingStandards.CONTENT_HEIGHT}mm</div>
                        <div>
                            Margins: L:{ScreenplayFormattingStandards.MARGIN_LEFT}mm R:{ScreenplayFormattingStandards.MARGIN_RIGHT}mm
                        </div>
                    </div>
                )}

                {/* Page container with industry-standard dimensions */}
                <div
                    ref={ref}
                    className={cn(
                        "mx-auto bg-white dark:bg-gray-900 shadow-xl relative overflow-visible print:shadow-none",
                        "isolate", // Creates new stacking context to contain block type indicators
                        className,
                    )}
                    style={{
                        width: cssValues.pageWidth,
                        height: cssValues.pageHeight,
                        maxWidth: cssValues.pageWidth,
                        minHeight: cssValues.pageHeight,
                    }}
                >
                    {/* Page content area with industry-standard margins */}
                    <div
                        className="relative h-full overflow-visible"
                        style={{
                            paddingTop: cssValues.marginTop,
                            paddingRight: cssValues.marginRight,
                            paddingBottom: cssValues.marginBottom,
                            paddingLeft: cssValues.marginLeft,
                        }}
                    >
                        {/* Page number (industry standard position) */}
                        <div
                            className="absolute text-xs font-mono z-10"
                            style={{
                                top: "12.7mm", // 0.5 inch from top
                                right: "12.7mm", // 0.5 inch from right
                                fontSize: "10pt",
                                fontFamily: cssValues.fontFamily,
                                color: "#666",
                            }}
                        >
                            {pageNumber}.
                        </div>

                        {/* Content area with industry-standard dimensions */}
                        <div
                            className="h-full relative overflow-visible"
                            style={{
                                width: cssValues.contentWidth,
                                height: cssValues.contentHeight,
                                fontFamily: cssValues.fontFamily,
                                fontSize: cssValues.fontSize,
                                lineHeight: cssValues.lineHeight,
                            }}
                        >
                            {/* Industry-standard content formatting */}
                            <div className="relative w-full h-full">{children}</div>
                        </div>

                        {/* Remaining space indicator */}
                        {isLastPage && remainingHeight !== undefined && remainingHeight > 20 && (
                            <div
                                className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-400 pointer-events-none z-10"
                                style={{
                                    paddingBottom: "12.7mm", // 0.5 inch from bottom
                                    fontFamily: cssValues.fontFamily,
                                }}
                            >
                                {remainingHeight.toFixed(0)}pt remaining
                            </div>
                        )}
                    </div>

                    {/* Industry standard formatting guide overlay (debug mode) */}
                    {showDebugInfo && (
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            {/* Margin guides */}
                            <div
                                className="absolute border-l border-red-500"
                                style={{
                                    left: cssValues.marginLeft,
                                    top: 0,
                                    bottom: 0,
                                }}
                            />
                            <div
                                className="absolute border-r border-red-500"
                                style={{
                                    right: cssValues.marginRight,
                                    top: 0,
                                    bottom: 0,
                                }}
                            />
                            <div
                                className="absolute border-t border-red-500"
                                style={{
                                    top: cssValues.marginTop,
                                    left: 0,
                                    right: 0,
                                }}
                            />
                            <div
                                className="absolute border-b border-red-500"
                                style={{
                                    bottom: cssValues.marginBottom,
                                    left: 0,
                                    right: 0,
                                }}
                            />

                            {/* Character position guides */}
                            <div
                                className="absolute border-l border-green-500 opacity-30"
                                style={{
                                    left: `${ScreenplayFormattingStandards.MARGIN_LEFT + ScreenplayFormattingStandards.getElementMargins("CHARACTER").left}mm`,
                                    top: cssValues.marginTop,
                                    bottom: cssValues.marginBottom,
                                }}
                            />
                            <div
                                className="absolute border-l border-purple-500 opacity-30"
                                style={{
                                    left: `${ScreenplayFormattingStandards.MARGIN_LEFT + ScreenplayFormattingStandards.getElementMargins("DIALOGUE").left}mm`,
                                    top: cssValues.marginTop,
                                    bottom: cssValues.marginBottom,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Page break indicator */}
                {!isLastPage && (
                    <div className="flex items-center justify-center py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="h-px bg-gray-300 w-8"></div>
                            <span>Page Break (Industry Standard)</span>
                            <div className="h-px bg-gray-300 w-8"></div>
                        </div>
                    </div>
                )}
            </div>
        )
    },
)

ScreenplayPage.displayName = "ScreenplayPage"
