"use client"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { MeasurementUtils } from "@/lib/measurement-utils"
import { TitlePageGenerator, type TitlePageInfo } from "@/lib/title-page-generator"

interface TitlePageProps {
    titleInfo: TitlePageInfo
    pageNumber?: number
    className?: string
    showDebugInfo?: boolean
}

export const TitlePage = forwardRef<HTMLDivElement, TitlePageProps>(
    ({ titleInfo, pageNumber = 1, className, showDebugInfo = false }, ref) => {
        const cssValues = MeasurementUtils.getCSSValues()
        const titleGenerator = new TitlePageGenerator()
        const layout = titleGenerator.calculateTitlePageLayout(titleInfo)
        const validation = titleGenerator.validateTitleInfo(titleInfo)

        return (
            <div className="relative mb-8">
                {/* Debug info */}
                {showDebugInfo && (
                    <div className="mb-2 text-xs text-gray-500 font-mono bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                        <div>Title Page Debug:</div>
                        <div>Height: {MeasurementUtils.CONTENT_HEIGHT}mm</div>
                        <div>Title Y: {layout.titleY.toFixed(1)}mm</div>
                        <div>Author Y: {layout.authorY.toFixed(1)}mm</div>
                        {!validation.isValid && (
                            <div className="text-red-600 dark:text-red-400">Issues: {validation.issues.join(", ")}</div>
                        )}
                    </div>
                )}

                {/* Title page container with exact A4 dimensions */}
                <div
                    ref={ref}
                    className={cn(
                        "mx-auto bg-white dark:bg-gray-900 shadow-xl relative overflow-hidden print:shadow-none",
                        className,
                    )}
                    style={{
                        width: cssValues.pageWidth,
                        height: cssValues.pageHeight,
                        maxWidth: cssValues.pageWidth,
                        minHeight: cssValues.pageHeight,
                    }}
                >
                    {/* Page content area with precise margins */}
                    <div
                        className="relative h-full"
                        style={{
                            paddingTop: cssValues.marginTop,
                            paddingRight: cssValues.marginRight,
                            paddingBottom: cssValues.marginBottom,
                            paddingLeft: cssValues.marginLeft,
                        }}
                    >
                        {/* Page number */}
                        <div
                            className="absolute text-xs text-gray-500 font-mono"
                            style={{
                                top: "10mm",
                                right: "15mm",
                                fontSize: "10pt",
                            }}
                        >
                            {pageNumber}
                        </div>

                        {/* Title page content */}
                        <div
                            className="h-full relative"
                            style={{
                                width: cssValues.contentWidth,
                                height: cssValues.contentHeight,
                                fontFamily: "Courier New, monospace",
                                fontSize: cssValues.fontSize,
                                lineHeight: cssValues.lineHeight,
                            }}
                        >
                            {/* Title */}
                            <div
                                className="absolute w-full text-center"
                                style={{
                                    top: `${layout.titleY}mm`,
                                }}
                            >
                                <h1
                                    className="font-bold text-black dark:text-white"
                                    style={{
                                        fontSize: "18pt",
                                        letterSpacing: "0.1em",
                                        lineHeight: "1.2",
                                    }}
                                >
                                    {titleGenerator.formatTitleForDisplay(titleInfo.title)}
                                </h1>
                            </div>

                            {/* Author */}
                            {titleInfo.author && (
                                <div
                                    className="absolute w-full text-center"
                                    style={{
                                        top: `${layout.authorY}mm`,
                                    }}
                                >
                                    <div
                                        className="text-black dark:text-white"
                                        style={{
                                            fontSize: "14pt",
                                            lineHeight: "1.4",
                                        }}
                                    >
                                        {titleGenerator.formatAuthorForDisplay(titleInfo.author)}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {titleInfo.description && (
                                <div
                                    className="absolute w-full text-center px-8"
                                    style={{
                                        top: `${layout.descriptionY}mm`,
                                    }}
                                >
                                    <div
                                        className="text-gray-700 dark:text-gray-300 italic max-w-md mx-auto"
                                        style={{
                                            fontSize: "11pt",
                                            lineHeight: "1.5",
                                        }}
                                    >
                                        {titleInfo.description}
                                    </div>
                                </div>
                            )}

                            {/* Contact information (bottom left) */}
                            {titleInfo.contact && (
                                <div
                                    className="absolute"
                                    style={{
                                        bottom: `${MeasurementUtils.CONTENT_HEIGHT - layout.contactY}mm`,
                                        left: "0mm",
                                    }}
                                >
                                    <div
                                        className="text-gray-600 dark:text-gray-400"
                                        style={{
                                            fontSize: "10pt",
                                            lineHeight: "1.3",
                                        }}
                                    >
                                        {titleInfo.contact.split("\n").map((line, index) => (
                                            <div key={index}>{line}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Date (bottom right) */}
                            <div
                                className="absolute"
                                style={{
                                    bottom: `${MeasurementUtils.CONTENT_HEIGHT - layout.dateY}mm`,
                                    right: "0mm",
                                }}
                            >
                                <div
                                    className="text-gray-600 dark:text-gray-400"
                                    style={{
                                        fontSize: "10pt",
                                        lineHeight: "1.3",
                                    }}
                                >
                                    {titleGenerator.formatDateForDisplay(titleInfo.date)}
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Subtle border */}
                                <div
                                    className="absolute border border-gray-200 dark:border-gray-700"
                                    style={{
                                        top: "20mm",
                                        left: "10mm",
                                        right: "10mm",
                                        bottom: "20mm",
                                        borderWidth: "0.5pt",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page break indicator */}
                <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="h-px bg-gray-300 w-8"></div>
                        <span>Title Page Complete</span>
                        <div className="h-px bg-gray-300 w-8"></div>
                    </div>
                </div>
            </div>
        )
    },
)

TitlePage.displayName = "TitlePage"
