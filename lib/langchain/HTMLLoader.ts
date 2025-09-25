import { BaseDocumentLoader } from '@langchain/core/document_loaders/base'
import { Document } from '@langchain/core/documents'

/**
 * A class that extends the `BaseDocumentLoader` class. It represents a
 * document loader that loads documents from HTML files.
 */
export class HTMLLoader extends BaseDocumentLoader {
  constructor(public blob: Blob) {
    super()
  }

  /**
   * A protected method that takes an HTML content and metadata as a parameter and returns
   * a promise that resolves to an array of objects representing the content
   * and metadata of each chapter.
   * @param htmlContent The HTML content to parse.
   * @returns A promise that resolves to an array of objects representing the content and metadata of each chapter.
   */
  protected async parse(htmlContent: string): Promise<string[]> {
    const { htmlToText } = await HtmlToTextImport()

    return [htmlToText(htmlContent)]
  }

  /**
   * A method that loads the HTML file and returns a promise that resolves
   * to an array of `Document` instances.
   * @returns A promise that resolves to an array of `Document` instances.
   */
  public async load(): Promise<Document[]> {
    const htmlContent = await this.blob.text()
    const metadata = { source: 'blob', blobType: this.blob.type }

    const parsed = await this.parse(htmlContent)
    parsed.forEach((pageContent, i) => {
      if (typeof pageContent !== 'string') {
        throw new Error(`Expected string, at position ${i} got ${typeof pageContent}`)
      }
    })
    return parsed.map(
      (pageContent, i) =>
        new Document({
          pageContent,
          metadata:
            parsed.length === 1
              ? metadata
              : {
                  ...metadata,
                  line: i + 1
                }
        })
    )
  }
}

async function HtmlToTextImport() {
  const { htmlToText } = await import('html-to-text').catch(() => {
    throw new Error(
      'Failed to load html-to-text. Please install it with eg. `npm install html-to-text`.'
    )
  })
  return { htmlToText }
}
