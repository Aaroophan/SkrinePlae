import type { ScreenplayDocument } from "@/types/screenplay"
import { DocxPageCalculator } from "./docx-page-calculator"
import { TitlePageGenerator, type TitlePageInfo } from "./title-page-generator"
import { MeasurementUtils } from "./measurement-utils"

export class EnhancedDocxExporter {
    private pageCalculator = new DocxPageCalculator()
    private titleGenerator = new TitlePageGenerator()

    async exportToDocx(screenplay: ScreenplayDocument): Promise<Blob> {
        try {
            // Dynamically import docx to avoid SSR issues
            const {
                Document,
                Packer,
                Paragraph,
                TextRun,
                AlignmentType,
                PageBreak,
                SectionType,
                PageNumber,
                Footer,
                Header,
            } = await import("docx")

            // Prepare title page information
            const titleInfo: TitlePageInfo = {
                title: screenplay.title || "Untitled Screenplay",
                author: screenplay.author || undefined,
                description: screenplay.description || undefined,
                date: screenplay.createdAt ? new Date(screenplay.createdAt).toLocaleDateString() : undefined,
            }

            // Calculate DOCX elements and page breaks
            const elements = this.pageCalculator.calculateDocxElements(screenplay.blocks, titleInfo)
            const pages = this.pageCalculator.calculateDocxPageBreaks(elements)

            // Validate page breaks
            const validation = this.pageCalculator.validateDocxPageBreaks(pages)
            if (!validation.isValid) {
                console.warn("DOCX Export - Page break validation issues:", validation.issues)
            }

            // Create DOCX paragraphs from elements
            const children: any[] = []

            elements.forEach((element, index) => {
                if (element.type === "pageBreak") {
                    children.push(new Paragraph({ children: [new PageBreak()] }))
                } else {
                    // Convert alignment
                    let alignment = AlignmentType.LEFT
                    if (element.alignment === "center") alignment = AlignmentType.CENTER
                    if (element.alignment === "right") alignment = AlignmentType.RIGHT

                    // Create text run
                    const textRun = new TextRun({
                        text: element.content,
                        bold: element.formatting.bold,
                        italics: element.formatting.italic,
                        size: element.formatting.fontSize,
                        font: element.formatting.fontFamily,
                    })

                    // Create paragraph with proper spacing and indentation
                    const paragraph = new Paragraph({
                        children: [textRun],
                        alignment: alignment,
                        spacing: {
                            before: element.spacing.before,
                            after: element.spacing.after,
                            line: element.spacing.lineSpacing,
                        },
                        indent: element.indent
                            ? {
                                left: element.indent,
                            }
                            : undefined,
                    })

                    children.push(paragraph)
                }
            })

            // Create document with precise A4 settings
            const doc = new Document({
                sections: [
                    {
                        properties: {
                            type: SectionType.CONTINUOUS,
                            page: {
                                size: {
                                    width: MeasurementUtils.mmToPt(210) * 20, // A4 width in twips
                                    height: MeasurementUtils.mmToPt(297) * 20, // A4 height in twips
                                },
                                margin: {
                                    top: MeasurementUtils.mmToPt(25) * 20,
                                    right: MeasurementUtils.mmToPt(20) * 20,
                                    bottom: MeasurementUtils.mmToPt(25) * 20,
                                    left: MeasurementUtils.mmToPt(20) * 20,
                                },
                            },
                            headers: {
                                default: new Header({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    children: [PageNumber.CURRENT],
                                                    size: 20, // 10pt
                                                    font: "Courier New",
                                                }),
                                            ],
                                            alignment: AlignmentType.RIGHT,
                                        }),
                                    ],
                                }),
                            },
                        },
                        children: children,
                    },
                ],
                styles: {
                    default: {
                        document: {
                            run: {
                                font: "Courier New",
                                size: 24, // 12pt in half-points
                            },
                            paragraph: {
                                spacing: {
                                    line: MeasurementUtils.LINE_HEIGHT_RATIO * 240, // Line spacing in twips
                                },
                            },
                        },
                    },
                },
            })

            // Generate DOCX blob
            const blob = await Packer.toBlob(doc)
            return blob
        } catch (error) {
            console.error("Error creating DOCX:", error)
            throw new Error(`Failed to create DOCX: ${error.message}`)
        }
    }

    async downloadDocx(screenplay: ScreenplayDocument): Promise<void> {
        try {
            const blob = await this.exportToDocx(screenplay)

            // Download the file
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${screenplay.title || "screenplay"}.docx`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error downloading DOCX:", error)
            throw error
        }
    }
}
