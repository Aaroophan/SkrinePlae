import { EnhancedDocxExporter } from "./enhanced-docx-export"
import type { ScreenplayDocument } from "@/types/screenplay"

export class DocxToPdfConverter {
    private docxExporter = new EnhancedDocxExporter()

    async convertDocxToPdf(screenplay: ScreenplayDocument): Promise<Blob> {
        try {
            // First, generate the DOCX
            const docxBlob = await this.docxExporter.exportToDocx(screenplay)

            // For client-side conversion, we'll use a PDF generation approach
            // that reads the DOCX structure and recreates it in PDF format
            return await this.generatePdfFromDocxStructure(screenplay, docxBlob)
        } catch (error) {
            console.error("Error converting DOCX to PDF:", error)
            throw new Error(`Failed to convert DOCX to PDF: ${error.message}`)
        }
    }

    private async generatePdfFromDocxStructure(screenplay: ScreenplayDocument, docxBlob: Blob): Promise<Blob> {
        try {
            // Import jsPDF
            const { jsPDF } = await import("jspdf")

            // Import other required modules
            const { DocxPageCalculator } = await import("./docx-page-calculator")
            const { TitlePageGenerator } = await import("./title-page-generator")
            const { MeasurementUtils } = await import("./measurement-utils")

            const pageCalculator = new DocxPageCalculator()
            const titleGenerator = new TitlePageGenerator()

            // Prepare title info
            const titleInfo = {
                title: screenplay.title || "Untitled Screenplay",
                author: screenplay.author || undefined,
                description: screenplay.description || undefined,
                date: screenplay.createdAt ? new Date(screenplay.createdAt).toLocaleDateString() : undefined,
            }

            // Calculate DOCX elements and pages
            const elements = pageCalculator.calculateDocxElements(screenplay.blocks, titleInfo)
            const pages = pageCalculator.calculateDocxPageBreaks(elements)

            // Create PDF with same structure as DOCX
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            // Set default font
            doc.setFont("courier", "normal")

            pages.forEach((page, pageIndex) => {
                if (pageIndex > 0) {
                    doc.addPage()
                }

                // Add page number (matching DOCX header)
                doc.setFontSize(10)
                doc.text(page.pageNumber.toString(), 190, 15)

                // Render page content based on DOCX elements
                this.renderPageFromDocxElements(doc, page.docxElements, page.isTitlePage)
            })

            // Convert to blob
            const pdfBlob = doc.output("blob")
            return pdfBlob
        } catch (error) {
            console.error("Error generating PDF from DOCX structure:", error)
            throw error
        }
    }

    private renderPageFromDocxElements(doc: any, elements: any[], isTitlePage: boolean): void {
        // Import MeasurementUtils at the top of the file instead of using require
        let yPosition = 25 // MeasurementUtils.MARGIN_TOP
        const marginLeft = 20 // MeasurementUtils.MARGIN_LEFT
        const lineHeightMm = 4.5 // MeasurementUtils.LINE_HEIGHT_MM
        const contentWidth = 170 // MeasurementUtils.CONTENT_WIDTH

        elements.forEach((element) => {
            if (element.type === "pageBreak") return

            // Set font properties based on DOCX formatting
            const fontSize = element.formatting.fontSize / 2 // Convert half-points to points
            doc.setFontSize(fontSize)

            if (element.formatting.bold && element.formatting.italic) {
                doc.setFont("courier", "bolditalic")
            } else if (element.formatting.bold) {
                doc.setFont("courier", "bold")
            } else if (element.formatting.italic) {
                doc.setFont("courier", "italic")
            } else {
                doc.setFont("courier", "normal")
            }

            // Add spacing before
            yPosition += (element.spacing.before / 20) * 0.352778 // Convert twips to mm

            // Handle alignment and indentation
            let xPosition = marginLeft
            if (element.indent) {
                xPosition += (element.indent / 20) * 0.352778 // Convert twips to mm
            }

            // Render text based on alignment
            if (element.alignment === "center") {
                const textWidth = doc.getTextWidth(element.content)
                xPosition = (210 - textWidth) / 2
                doc.text(element.content, xPosition, yPosition)
            } else if (element.alignment === "right") {
                const textWidth = doc.getTextWidth(element.content)
                xPosition = 210 - 20 - textWidth // 20 = MARGIN_RIGHT
                doc.text(element.content, xPosition, yPosition)
            } else {
                // Left alignment or indented
                const maxWidth = contentWidth - (element.indent ? (element.indent / 20) * 0.352778 : 0)
                const lines = doc.splitTextToSize(element.content, maxWidth)
                lines.forEach((line: string, lineIndex: number) => {
                    doc.text(line, xPosition, yPosition + lineIndex * lineHeightMm)
                })
                yPosition += (lines.length - 1) * lineHeightMm
            }

            // Move to next line
            yPosition += lineHeightMm

            // Add spacing after
            yPosition += (element.spacing.after / 20) * 0.352778 // Convert twips to mm
        })
    }

    async downloadPdfFromDocx(screenplay: ScreenplayDocument): Promise<void> {
        try {
            const pdfBlob = await this.convertDocxToPdf(screenplay)

            // Download the PDF
            const url = URL.createObjectURL(pdfBlob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${screenplay.title || "screenplay"}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error downloading PDF from DOCX:", error)
            throw error
        }
    }

    // Alternative method using server-side conversion (if available)
    async convertDocxToPdfServer(docxBlob: Blob): Promise<Blob> {
        try {
            // This would be used if you have a server endpoint for DOCX to PDF conversion
            const formData = new FormData()
            formData.append("docx", docxBlob, "screenplay.docx")

            const response = await fetch("/api/convert-docx-to-pdf", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`Server conversion failed: ${response.statusText}`)
            }

            return await response.blob()
        } catch (error) {
            console.error("Server-side DOCX to PDF conversion failed:", error)
            // Fallback to client-side conversion
            throw error
        }
    }
}
