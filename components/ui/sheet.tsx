'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Sheet({ open, onClose, children, side = 'left' }: { open: boolean; onClose: () => void; children: React.ReactNode; side?: 'left' | 'right' }) {
  const ref = React.useRef<HTMLDialogElement>(null)
  React.useEffect(() => {
    if (open) ref.current?.showModal()
    else ref.current?.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className={cn(
        'm-0 h-full max-h-full w-80 max-w-[80vw] bg-background text-foreground p-4 backdrop:bg-black/40',
        side === 'left' ? 'mr-auto' : 'ml-auto'
      )}
    >
      {children}
    </dialog>
  )
}
