import type { ScreenplayDocument } from "@/types/screenplay"
import { EnhancedDocxExporter } from "./enhanced-docx-export"
import { DocxToPdfConverter } from "./docx-to-pdf-converter"
import type { TitlePageGenerator, TitlePageInfo } from "./title-page-generator"
import { MeasurementUtils } from "./measurement-utils"

// Enhanced export with DOCX priority
export async function exportScreenplay(screenplay: ScreenplayDocument, format: "pdf" | "doc" | "txt") {
  if (!screenplay || !screenplay.blocks || screenplay.blocks.length === 0) {
    throw new Error("No content to export")
  }

  const docxExporter = new EnhancedDocxExporter()
  const pdfConverter = new DocxToPdfConverter()

  switch (format) {
    case "doc":
      // Primary DOCX export
      await docxExporter.downloadDocx(screenplay)
      break

    case "pdf":
      // PDF generated from DOCX structure
      await pdfConverter.downloadPdfFromDocx(screenplay)
      break

    case "txt":
      // Fallback text export
      await exportToText(screenplay)
      break

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

// Legacy exports for compatibility
export async function exportToPDF(screenplay: ScreenplayDocument) {
  const pdfConverter = new DocxToPdfConverter()
  await pdfConverter.downloadPdfFromDocx(screenplay)
}

export async function exportToDoc(screenplay: ScreenplayDocument) {
  const docxExporter = new EnhancedDocxExporter()
  await docxExporter.downloadDocx(screenplay)
}

// Enhanced text export with DOCX structure
async function exportToText(screenplay: ScreenplayDocument) {
  try {
    const { DocxPageCalculator } = await import("./docx-page-calculator")
    const { TitlePageGenerator } = await import("./title-page-generator")

    const pageCalculator = new DocxPageCalculator()
    const titleGenerator = new TitlePageGenerator()

    const titleInfo = {
      title: screenplay.title || "Untitled Screenplay",
      author: screenplay.author || undefined,
      description: screenplay.description || undefined,
      date: screenplay.createdAt ? new Date(screenplay.createdAt).toLocaleDateString() : undefined,
    }

    const elements = pageCalculator.calculateDocxElements(screenplay.blocks, titleInfo)
    const pages = pageCalculator.calculateDocxPageBreaks(elements)

    let output = ""

    pages.forEach((page, pageIndex) => {
      if (pageIndex > 0) {
        output += "\n\n--- PAGE BREAK (DOCX Compatible) ---\n\n"
      }

      output += `PAGE ${page.pageNumber}\n`
      output += `DOCX Height: ${page.usedHeight.toFixed(1)}pt\n\n`

      if (page.isTitlePage && page.titleInfo) {
        output += "=== TITLE PAGE (DOCX Format) ===\n\n"
        output += `${page.titleInfo.title.toUpperCase()}\n\n`

        if (page.titleInfo.author) {
          output += `by ${page.titleInfo.author}\n\n`
        }

        if (page.titleInfo.description) {
          output += `${page.titleInfo.description}\n\n`
        }

        output += `${titleGenerator.formatDateForDisplay(page.titleInfo.date)}\n`
      } else {
        // Content blocks for this page
        page.blocks.forEach((block) => {
          if (!block.content.trim()) return

          switch (block.type) {
            case "scene_heading":
              output += `${block.content.toUpperCase()}\n\n`
              break
            case "action":
              output += `${block.content}\n\n`
              break
            case "character":
              output += `                    ${block.content.toUpperCase()}\n`
              break
            case "dialogue":
              output += `              ${block.content}\n`
              break
            case "parenthetical":
              output += `                   ${block.content}\n`
              break
            case "transition":
              output += `                                        ${block.content.toUpperCase()}\n\n`
              break
          }
        })
      }
    })

    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${screenplay.title || "screenplay"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting to text:", error)
    throw error
  }
}

function renderTitlePageToPDF(doc: any, titleInfo: TitlePageInfo, titleGenerator: TitlePageGenerator) {
  const layout = titleGenerator.calculateTitlePageLayout(titleInfo)
  const marginLeft = MeasurementUtils.MARGIN_LEFT
  const marginTop = MeasurementUtils.MARGIN_TOP

  // Title
  doc.setFont("courier", "bold")
  doc.setFontSize(18)
  const titleText = titleGenerator.formatTitleForDisplay(titleInfo.title)
  const titleWidth = doc.getTextWidth(titleText)
  const titleX = (210 - titleWidth) / 2
  doc.text(titleText, titleX, marginTop + layout.titleY)

  // Author
  if (titleInfo.author) {
    doc.setFont("courier", "normal")
    doc.setFontSize(14)
    const authorText = titleGenerator.formatAuthorForDisplay(titleInfo.author)
    const authorWidth = doc.getTextWidth(authorText)
    const authorX = (210 - authorWidth) / 2
    doc.text(authorText, authorX, marginTop + layout.authorY)
  }

  // Description
  if (titleInfo.description) {
    doc.setFont("courier", "italic")
    doc.setFontSize(11)
    const descLines = doc.splitTextToSize(titleInfo.description, 120) // Narrower for description
    const startY = marginTop + layout.descriptionY
    descLines.forEach((line: string, index: number) => {
      const lineWidth = doc.getTextWidth(line)
      const lineX = (210 - lineWidth) / 2
      doc.text(line, lineX, startY + index * 5)
    })
  }

  // Contact info (bottom left)
  if (titleInfo.contact) {
    doc.setFont("courier", "normal")
    doc.setFontSize(10)
    const contactLines = titleInfo.contact.split("\n")
    contactLines.forEach((line, index) => {
      doc.text(line, marginLeft, marginTop + layout.contactY + index * 4)
    })
  }

  // Date (bottom right)
  doc.setFont("courier", "normal")
  doc.setFontSize(10)
  const dateText = titleGenerator.formatDateForDisplay(titleInfo.date)
  const dateWidth = doc.getTextWidth(dateText)
  doc.text(dateText, 210 - MeasurementUtils.MARGIN_RIGHT - dateWidth, marginTop + layout.dateY)

  // Decorative border
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.rect(marginLeft + 10, marginTop + 20, MeasurementUtils.CONTENT_WIDTH - 20, MeasurementUtils.CONTENT_HEIGHT - 40)
}

function renderContentPageToPDF(doc: any, page: any, marginLeft: number, marginTop: number, lineHeight: number) {
  let yPosition = marginTop

  // Render blocks for this page using exact same spacing as UI
  page.blocks.forEach((block: any) => {
    doc.setFontSize(MeasurementUtils.FONT_SIZE_PT)

    switch (block.type) {
      case "scene_heading":
        yPosition += 6 // spacing before
        doc.setFont("courier", "bold")
        const sceneLines = doc.splitTextToSize(block.content.toUpperCase(), MeasurementUtils.CONTENT_WIDTH)
        sceneLines.forEach((line: string) => {
          doc.text(line, marginLeft, yPosition)
          yPosition += lineHeight
        })
        yPosition += 6 // spacing after
        break

      case "action":
        doc.setFont("courier", "normal")
        const actionLines = doc.splitTextToSize(block.content, MeasurementUtils.CONTENT_WIDTH)
        actionLines.forEach((line: string) => {
          doc.text(line, marginLeft, yPosition)
          yPosition += lineHeight
        })
        yPosition += 3 // spacing after
        break

      case "character":
        yPosition += 6 // spacing before
        doc.setFont("courier", "bold")
        const charX = 105 // Center position
        doc.text(block.content.toUpperCase(), charX, yPosition, { align: "center" })
        yPosition += lineHeight
        // No spacing after - kept with dialogue
        break

      case "dialogue":
        doc.setFont("courier", "normal")
        const dialogueWidth = MeasurementUtils.CONTENT_WIDTH * 0.6
        const dialogueLines = doc.splitTextToSize(block.content, dialogueWidth)
        dialogueLines.forEach((line: string) => {
          doc.text(line, marginLeft + 30, yPosition) // Indented
          yPosition += lineHeight
        })
        // No spacing after
        break

      case "parenthetical":
        doc.setFont("courier", "italic")
        const parentheticalWidth = MeasurementUtils.CONTENT_WIDTH * 0.5
        const parentheticalLines = doc.splitTextToSize(block.content, parentheticalWidth)
        parentheticalLines.forEach((line: string) => {
          doc.text(line, marginLeft + 40, yPosition) // More indented
          yPosition += lineHeight
        })
        // No spacing after
        break

      case "transition":
        yPosition += 6 // spacing before
        doc.setFont("courier", "bold")
        const transX = 210 - MeasurementUtils.MARGIN_RIGHT - doc.getTextWidth(block.content.toUpperCase())
        doc.text(block.content.toUpperCase(), transX, yPosition)
        yPosition += lineHeight
        yPosition += 12 // spacing after
        break
    }
  })
}
