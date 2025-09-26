'use client'

import { Button } from '@/components/ui/button'
import { resumeSchema } from '@/lib/schema'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const Dropzone = dynamic(() => import('@/components/dropzone').then((mod) => mod.Dropzone), {
  ssr: false
})

export default function Home() {
  const [resume, setResume] = useState<string | null>(null)

  const { object, submit } = useObject({
    api: '/api/resume',
    schema: resumeSchema
  })

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-4'>
      <Dropzone onFileChange={setResume} />
      <Button disabled={!resume} onClick={() => submit({ prompt: resume })} className='w-80'>
        Parse
      </Button>
      {object && (
        <div className='flex flex-col gap-2'>
          <h2 className='text-lg font-bold'>Generated Resume</h2>
          <pre className='whitespace-pre-wrap'>{JSON.stringify(object, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
