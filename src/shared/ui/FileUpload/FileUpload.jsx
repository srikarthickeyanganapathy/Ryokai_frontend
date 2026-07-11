import React, { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Heading, Text } from '@/shared/ui/Typography'

export function FileUpload({ 
  onFileSelect, 
  accept, 
  maxSize,
  className,
  title = "Click to upload",
  description = "or drag and drop",
  hint = "SVG, PNG, JPG or GIF (max. 800x400px)"
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    // In a real implementation, handle multiple files and validation here
    if (onFileSelect) {
      onFileSelect(files[0])
    }
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        className
      )}
    >
      <label
        htmlFor="dropzone-file"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[var(--radius-lg)] cursor-pointer bg-[var(--bg-elevated)] transition-[background-color,border-color,transform] duration-[var(--duration-base)] ease-[var(--ease-out)]",
          isDragging 
            ? "border-[var(--accent)] bg-[var(--accent-soft)] scale-[1.01] shadow-[var(--accent-glow)]" 
            : "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full mb-3 border transition-colors duration-[var(--duration-base)]",
            isDragging
              ? "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)]"
              : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] shadow-[var(--inset-highlight-soft)]"
          )}>
            <UploadCloud className="w-5 h-5" />
          </div>
          <Heading level={5} className="mb-1">{title}</Heading>
          <Text size="sm" variant="muted" className="mb-2">{description}</Text>
          <Text size="xs" variant="muted">{hint}</Text>
        </div>
        <input 
          id="dropzone-file" 
          type="file" 
          className="hidden" 
          ref={inputRef}
          onChange={handleChange}
          accept={accept}
        />
      </label>
    </div>
  )
}