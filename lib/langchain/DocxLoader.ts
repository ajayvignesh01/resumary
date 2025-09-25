import { BaseDocumentLoader } from '@langchain/core/document_loaders/base'
import { Document } from '@langchain/core/documents'

type DocxLoaderOptions = {
  type: 'docx' | 'doc'
}
/**
 * A class that extends the `BaseDocumentLoader` class. It represents a document
 * loader that loads documents from DOCX files.
 * It has a constructor that takes a `blob` parameter representing a Blob
 * object, and an optional `options` parameter of type
 * `DocxLoaderOptions`
 */
export class DocxLoader extends BaseDocumentLoader {
  protected blob: Blob
  protected options: DocxLoaderOptions = { type: 'docx' }

  constructor(blob: Blob, options?: DocxLoaderOptions) {
    super()
    this.blob = blob
    if (options) {
      this.options = {
        ...options
      }
    }
  }

  /**
   * Method that reads the buffer contents and metadata of
   * `blob`, and then calls the `parse()` method to parse the
   * buffer and return the documents.
   * @returns Promise that resolves with an array of `Document` objects.
   */
  public async load(): Promise<Document[]> {
    const arrayBuffer = await this.blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const metadata = { source: 'blob', blobType: this.blob.type }

    return this.parse({ arrayBuffer, buffer }, metadata)
  }

  /**
   * A method that takes a `raw` buffer and `metadata` as parameters and
   * returns a promise that resolves to an array of `Document` instances. It
   * uses the `extractRawText` function from the `mammoth` module or
   * `extract` method from the `word-extractor` module to extract
   * the raw text content from the buffer. If the extracted text content is
   * empty, it returns an empty array. Otherwise, it creates a new
   * `Document` instance with the extracted text content and the provided
   * metadata, and returns it as an array.
   * @param raw The raw buffer from which to extract text content.
   * @param metadata The metadata to be associated with the created `Document` instance.
   * @returns A promise that resolves to an array of `Document` instances.
   */
  public async parse(
    raw: { arrayBuffer: ArrayBuffer; buffer: Buffer },
    metadata: Document['metadata']
  ): Promise<Document[]> {
    // if (this.options.type === 'doc') {
    //   return this.parseDoc(raw, metadata)
    // }
    return this.parseDocx(raw.arrayBuffer, metadata)
  }

  /**
   * A private method that takes a `raw` buffer and `metadata` as parameters and
   * returns a promise that resolves to an array of `Document` instances. It
   * uses the `extractRawText` function from the `mammoth` module to extract
   * the raw text content from the buffer. If the extracted text content is
   * empty, it returns an empty array. Otherwise, it creates a new
   * `Document` instance with the extracted text content and the provided
   * metadata, and returns it as an array.
   * @param raw The raw buffer from which to extract text content.
   * @param metadata The metadata to be associated with the created `Document` instance.
   * @returns A promise that resolves to an array of `Document` instances.
   */
  private async parseDocx(raw: ArrayBuffer, metadata: Document['metadata']): Promise<Document[]> {
    const { extractRawText } = await DocxLoaderImports()

    const docx = await extractRawText({
      arrayBuffer: raw
    })

    if (!docx.value) return []

    return [
      new Document({
        pageContent: docx.value,
        metadata
      })
    ]
  }

  /**
   * A private method that takes a `raw` buffer and `metadata` as parameters and
   * returns a promise that resolves to an array of `Document` instances. It
   * uses the `extract` method from the `word-extractor` module to extract
   * the raw text content from the buffer. If the extracted text content is
   * empty, it returns an empty array. Otherwise, it creates a new
   * `Document` instance with the extracted text content and the provided
   * metadata, and returns it as an array.
   * @param raw The raw buffer from which to extract text content.
   * @param metadata The metadata to be associated with the created `Document` instance.
   * @returns A promise that resolves to an array of `Document` instances.
   */
  // private async parseDoc(raw: Buffer, metadata: Document['metadata']): Promise<Document[]> {
  //   const WordExtractor = await DocLoaderImports()
  //   const extractor = new WordExtractor()
  //   const doc = await extractor.extract(raw)
  //   return [
  //     new Document({
  //       pageContent: doc.getBody(),
  //       metadata
  //     })
  //   ]
  // }
}

async function DocxLoaderImports() {
  try {
    const { extractRawText } = await import('mammoth')
    return { extractRawText }
  } catch (e) {
    console.error(e)
    throw new Error('Failed to load mammoth. Please install it with eg. `npm install mammoth`.')
  }
}

// async function DocLoaderImports() {
//   try {
//     const WordExtractor = await import('word-extractor')
//     return WordExtractor.default
//   } catch (e) {
//     console.error(e)
//     throw new Error(
//       'Failed to load word-extractor. Please install it with eg. `npm install word-extractor`.'
//     )
//   }
// }
