import { BaseDocumentLoader } from '@langchain/core/document_loaders/base'
import { Document } from '@langchain/core/documents'

/**
 * A class that extends the `BaseDocumentLoader` class. It represents a
 * document loader that loads documents from a text file. The `load()`
 * method is implemented to read the text from the blob, parse it
 * using the `parse()` method, and create a `Document` instance for each
 * parsed page. The metadata includes the source of the text (blob) and,
 * if there are multiple pages, the line number of each page.
 * @example
 * ```typescript
 * const loader = new TextLoader(blob);
 * const docs = await loader.load();
 * ```
 */
export class TextLoader extends BaseDocumentLoader {
  constructor(public blob: Blob) {
    super()
  }

  /**
   * A protected method that takes a `raw` string as a parameter and returns
   * a promise that resolves to an array containing the raw text as a single
   * element.
   * @param raw The raw text to be parsed.
   * @returns A promise that resolves to an array containing the raw text as a single element.
   */
  protected async parse(raw: string): Promise<string[]> {
    return [raw]
  }

  /**
   * A method that loads the text blob and returns a promise that
   * resolves to an array of `Document` instances. It reads the text from
   * the blob using the `text()` method of the blob. It then
   * parses the text using the `parse()` method and creates a `Document`
   * instance for each parsed page. The metadata includes the source of the
   * text (blob) and, if there are multiple pages, the line
   * number of each page.
   * @returns A promise that resolves to an array of `Document` instances.
   */
  public async load(): Promise<Document[]> {
    const text = await this.blob.text()
    const metadata = { source: 'blob', blobType: this.blob.type }

    const parsed = await this.parse(text)
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
