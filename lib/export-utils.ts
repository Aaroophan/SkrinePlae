import { type ScreenplayDocument, BlockType } from "@/types/screenplay"

export async function exportToPDF(screenplay: ScreenplayDocument) {
  // Create a formatted text version
  const formattedText = formatScreenplayForExport(screenplay)

  // Create a blob and download
  const blob = new Blob([formattedText], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${screenplay.title}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportToDoc(screenplay: ScreenplayDocument) {
  // Create a formatted text version
  const formattedText = formatScreenplayForExport(screenplay)

  // Create a blob and download
  const blob = new Blob([formattedText], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${screenplay.title}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatScreenplayForExport(screenplay: ScreenplayDocument): string {
  let output = `${screenplay.title.toUpperCase()}\n\n`

  screenplay.blocks.forEach((block) => {
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
