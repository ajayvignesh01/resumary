import * as pdfjs from 'pdfjs-dist'
import { createWorker, type Worker } from 'tesseract.js'

import { DocxLoader } from './langchain/DocxLoader'
import { HTMLLoader } from './langchain/HTMLLoader'
import PDFLoader from './langchain/PDFLoader'
import { TextLoader } from './langchain/TextLoader'
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export class TextExtractor {
  constructor(private readonly file: File) {}

  async extractText(): Promise<string> {
    const extension = this.file.type

    switch (extension) {
      case 'application/pdf':
        return await this.extractPdfText(this.file)
      //   case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractDocxText(this.file)
      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
        return await this.extractImageText(this.file)
      case 'text/plain':
        return await this.extractTextText(this.file)
      case 'text/html':
        return await this.extractHTMLText(this.file)
      default:
        throw new Error('Unsupported file type')
    }
  }

  async extractPdfText(file: File): Promise<string> {
    try {
      const loader = new PDFLoader(file)
      const docs = await loader.load()
      const text = docs.map((doc) => doc.pageContent).join('\n')
      if (text.trim().length > 10) {
        return text.trim()
      }

      // Fallback to OCR
      console.log('PDF text extraction yielded minimal results, falling back to OCR...')
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      const ocrPromises: Promise<string>[] = []
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        ocrPromises.push(this.extractPageWithOCR(pdf, pageNum))
      }
      const ocrText = await Promise.all(ocrPromises)
      return ocrText.join('\n').trim()
    } catch (error) {
      console.error('Error extracting PDF text:', error)
      throw new Error('Unable to extract text from PDF')
    }
  }

  async extractPageWithOCR(pdf: pdfjs.PDFDocumentProxy, pageNum: number): Promise<string> {
    try {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 }) // Higher scale for better OCR accuracy

      // Create canvas to render the page
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.height = viewport.height
      canvas.width = viewport.width

      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      }).promise

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
          },
          'image/png',
          0.95
        )
      })

      // Create file from blob for tesseract
      const imageFile = new File([blob], `page-${pageNum}.png`, { type: 'image/png' })

      // Extract text with OCR using shared worker
      return await this.extractImageText(imageFile)
    } catch (error) {
      console.error(`Error extracting page ${pageNum} with OCR:`, error)
      return '' // Return empty string for failed pages
    }
  }

  async extractDocxText(file: File): Promise<string> {
    try {
      const loader = new DocxLoader(file)
      const docs = await loader.load()
      const text = docs.map((doc) => doc.pageContent).join('\n')
      return text.trim()
    } catch (error) {
      console.error('Error extracting DOCX text:', error)
      throw new Error('Unable to extract text from DOCX file')
    }
  }

  async extractImageText(file: File, worker?: Worker): Promise<string> {
    let currentWorker: Worker | undefined = worker

    try {
      if (!currentWorker) {
        currentWorker = await createWorker('eng')
      }

      const {
        data: { text }
      } = await currentWorker.recognize(file)

      return text.trim()
    } catch (error) {
      console.error('Error extracting image text with OCR:', error)
      throw new Error('Unable to extract text from image')
    } finally {
      // Terminate the worker if it was created by this function
      if (currentWorker) {
        await currentWorker.terminate()
      }
    }
  }

  async extractTextText(file: File): Promise<string> {
    try {
      const loader = new TextLoader(file)
      const docs = await loader.load()
      const text = docs.map((doc) => doc.pageContent).join('\n')
      return text.trim()
    } catch (error) {
      console.error('Error reading text file:', error)
      throw new Error('Unable to read text file')
    }
  }

  async extractHTMLText(file: File): Promise<string> {
    try {
      const loader = new HTMLLoader(file)
      const docs = await loader.load()
      const text = docs.map((doc) => doc.pageContent).join('\n')
      return text.trim()
    } catch (error) {
      console.error('Error extracting HTML text:', error)
      throw new Error('Unable to extract text from HTML file')
    }
  }
}
