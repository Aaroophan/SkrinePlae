import { type ScreenplayDocument, BlockType } from "@/types/screenplay"

// PDF export using jsPDF
export async function exportToPDF(screenplay: ScreenplayDocument) {
  try {
    // Dynamically import jsPDF to avoid SSR issues
    const { jsPDF } = await import("jspdf")

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set font
    doc.setFont("courier", "normal")
    doc.setFontSize(12)

    let yPosition = 20
    const pageHeight = 297 // A4 height in mm
    const margin = 20
    const lineHeight = 6

    // Title page
    if (screenplay.title) {
      doc.setFontSize(16)
      doc.setFont("courier", "bold")
      const titleWidth = doc.getTextWidth(screenplay.title.toUpperCase())
      const titleX = (210 - titleWidth) / 2 // Center on A4 width
      doc.text(screenplay.title.toUpperCase(), titleX, yPosition)
      yPosition += lineHeight * 2
    }

    if (screenplay.author) {
      doc.setFontSize(12)
      doc.setFont("courier", "normal")
      const authorText = `by ${screenplay.author}`
      const authorWidth = doc.getTextWidth(authorText)
      const authorX = (210 - authorWidth) / 2
      doc.text(authorText, authorX, yPosition)
      yPosition += lineHeight * 4
    }

    // Content
    screenplay.blocks.forEach((block) => {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }

      doc.setFontSize(12)

      switch (block.type) {
        case BlockType.SCENE_HEADING:
          doc.setFont("courier", "bold")
          doc.text(block.content.toUpperCase(), margin, yPosition)
          yPosition += lineHeight * 2
          break

        case BlockType.ACTION:
          doc.setFont("courier", "normal")
          const actionLines = doc.splitTextToSize(block.content, 170)
          actionLines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(line, margin, yPosition)
            yPosition += lineHeight
          })
          yPosition += lineHeight
          break

        case BlockType.CHARACTER:
          doc.setFont("courier", "bold")
          const charX = 105 // Center position
          doc.text(block.content.toUpperCase(), charX, yPosition, { align: "center" })
          yPosition += lineHeight
          break

        case BlockType.DIALOGUE:
          doc.setFont("courier", "normal")
          const dialogueLines = doc.splitTextToSize(block.content, 100)
          dialogueLines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(line, 50, yPosition) // Indented for dialogue
            yPosition += lineHeight
          })
          break

        case BlockType.PARENTHETICAL:
          doc.setFont("courier", "italic")
          doc.text(block.content, 60, yPosition) // More indented
          yPosition += lineHeight
          break

        case BlockType.TRANSITION:
          doc.setFont("courier", "bold")
          const transX = 190 - doc.getTextWidth(block.content.toUpperCase())
          doc.text(block.content.toUpperCase(), transX, yPosition)
          yPosition += lineHeight * 2
          break
      }
    })

    // Save the PDF
    doc.save(`${screenplay.title || "screenplay"}.pdf`)
  } catch (error) {
    console.error("Error exporting to PDF:", error)
    // Fallback to text export
    exportToText(screenplay, "pdf")
  }
}

// DOC export using docx library
export async function exportToDoc(screenplay: ScreenplayDocument) {
  try {
    // Dynamically import docx to avoid SSR issues
    const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx")

    const children: any[] = []

    // Title
    if (screenplay.title) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: screenplay.title.toUpperCase(),
              bold: true,
              size: 32,
              font: "Courier New",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      )
    }

    // Author
    if (screenplay.author) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `by ${screenplay.author}`,
              size: 24,
              font: "Courier New",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        }),
      )
    }

    // Content blocks
    screenplay.blocks.forEach((block) => {
      switch (block.type) {
        case BlockType.SCENE_HEADING:
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: block.content.toUpperCase(),
                  bold: true,
                  size: 24,
                  font: "Courier New",
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),
          )
          break

        case BlockType.ACTION:
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: block.content,
                  size: 24,
                  font: "Courier New",
                }),
              ],
              spacing: { after: 200 },
            }),
          )
          break

        case BlockType.CHARACTER:
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: block.content.toUpperCase(),
                  bold: true,
                  size: 24,
                  font: "Courier New",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200 },
            }),
          )
          break

        case BlockType.DIALOGUE:
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: block.content,
                  size: 24,
                  font: "Courier New",
                }),
              ],
              indent: { left: 1440 }, // 1 inch indent
            }),
          )
          break

        case BlockType.PARENTHETICAL:
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: block.content,
                  italics: true,
                  size: 24,
                  font: "Courier New",
                }),
              ],
              indent: { left: 1800 }, // 1.25 inch indent
            }),
          )
          break

        case BlockType.TRANSITION:
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: block.content.toUpperCase(),
                  bold: true,
                  size: 24,
                  font: "Courier New",
                }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 200, after: 400 },
            }),
          )
          break
      }
    })

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    })

    // Generate and download the document
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${screenplay.title || "screenplay"}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting to DOC:", error)
    // Fallback to text export
    exportToText(screenplay, "doc")
  }
}

// Fallback text export
function exportToText(screenplay: ScreenplayDocument, originalFormat: string) {
  const formattedText = formatScreenplayForExport(screenplay)

  const blob = new Blob([formattedText], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${screenplay.title || "screenplay"}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  // Show user notification about fallback
  console.warn(`Export to ${originalFormat.toUpperCase()} failed, exported as TXT instead`)
}

function formatScreenplayForExport(screenplay: ScreenplayDocument): string {
  let output = ""

  // Title and author
  if (screenplay.title) {
    output += `${screenplay.title.toUpperCase()}\n`
  }

  if (screenplay.author) {
    output += `by ${screenplay.author}\n`
  }

  output += `\n\n`

  // Content blocks
  screenplay.blocks.forEach((block) => {
    if (!block.content.trim()) return // Skip empty blocks

    switch (block.type) {
      case BlockType.SCENE_HEADING:
        output += `${block.content.toUpperCase()}\n\n`
        break
      case BlockType.ACTION:
        output += `${block.content}\n\n`
        break
      case BlockType.CHARACTER:
        output += `                    ${block.content.toUpperCase()}\n`
        break
      case BlockType.DIALOGUE:
        output += `              ${block.content}\n`
        break
      case BlockType.PARENTHETICAL:
        output += `                   ${block.content}\n`
        break
      case BlockType.TRANSITION:
        output += `                                        ${block.content.toUpperCase()}\n\n`
        break
    }
  })

  return output
}

// Enhanced export with format validation
export async function exportScreenplay(screenplay: ScreenplayDocument, format: "pdf" | "doc" | "txt") {
  if (!screenplay || !screenplay.blocks || screenplay.blocks.length === 0) {
    throw new Error("No content to export")
  }

  switch (format) {
    case "pdf":
      await exportToPDF(screenplay)
      break
    case "doc":
      await exportToDoc(screenplay)
      break
    case "txt":
      exportToText(screenplay, "txt")
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}
