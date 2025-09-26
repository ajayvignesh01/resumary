'use client'

import {
  DocFileIcon,
  DocxFileIcon,
  EmptyFileIcon,
  HtmlFileIcon,
  JpegFileIcon,
  JpgFileIcon,
  PdfFileIcon,
  PngFileIcon,
  TxtFileIcon
} from '@/components/icons'
import { TextExtractor } from '@/lib/text-extractor'
import { cn } from '@/lib/utils'
import { Loader2Icon } from 'lucide-react'
import { ComponentProps, useCallback, useState, useTransition } from 'react'
import { useDropzone } from 'react-dropzone'

interface DropzoneProps extends ComponentProps<'div'> {
  onFileChange: (resume: string) => void
}

export function Dropzone({ onFileChange, className, ...props }: DropzoneProps) {
  const [file, setFile] = useState<File | null>(null)

  const [isPending, startTransition] = useTransition()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      startTransition(async () => {
        const file = acceptedFiles[0]
        setFile(file)

        const textExtractor = new TextExtractor(file)
        const text = await textExtractor.extractText()
        onFileChange(text)
      })
    },
    [onFileChange]
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/*': ['.png', '.jpeg', '.jpg'],
        'text/plain': ['.txt'],
        'text/html': ['.html']
      }
    })

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'application/pdf':
        return PdfFileIcon
      case 'application/vnd.ms-excel':
        return DocFileIcon
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return DocxFileIcon
      case 'image/png':
        return PngFileIcon
      case 'image/jpeg':
        return JpegFileIcon
      case 'image/jpg':
        return JpgFileIcon
      case 'text/plain':
        return TxtFileIcon
      case 'text/html':
        return HtmlFileIcon
      default:
        return EmptyFileIcon
    }
  }
  const FileIcon = getFileIcon(file?.type)

  return (
    <div
      {...getRootProps()}
      className={cn(
        'hover:border-primary flex h-20 w-80 cursor-pointer items-center justify-center rounded-md border-2 border-dashed p-4 transition-colors',
        {
          'border-primary': isDragActive || isDragAccept,
          'border-destructive': isDragActive && isDragReject
        },
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />
      {isPending ? (
        <Loader2Icon className='animate-spin' />
      ) : file ? (
        <div className='flex w-full flex-row items-center gap-2 rounded-md border px-4 py-2 font-mono text-sm'>
          <FileIcon className='size-4 shrink-0' />
          <p className='truncate'>{file.name}</p>
        </div>
      ) : (
        <p>Upload a resume</p>
      )}
    </div>
  )
}
