import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { Heading, Text } from '@/shared/ui/Typography'

export function FileUpload({ 
  onFileSelect, 
  accept, 
  maxSize,
  className,
  title = "Click to upload",
  description = "or drag and drop",
  hint = "Images, PDF, documents or archives (max 20MB)"
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
    if (onFileSelect) {
      onFileSelect(files[0])
    }
  }

  return (
    <motion.div
      className={cn("flex w-full items-center justify-center", className)}
      animate={{ scale: isDragging ? 1.01 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <label
        htmlFor="dropzone-file"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[var(--radius-lg)] cursor-pointer bg-[var(--bg-elevated)] transition-[background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-out)]",
          isDragging 
            ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--accent-glow)]" 
            : "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <motion.div
            animate={{
              scale: isDragging ? 1.15 : 1,
              y: isDragging ? -4 : 0,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full mb-3 border transition-colors duration-[var(--duration-base)]",
              isDragging
                ? "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)]"
                : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] shadow-[var(--inset-highlight-soft)]"
            )}
          >
            <motion.div
              animate={{ rotate: isDragging ? [0, -5, 5, 0] : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <UploadCloud className="w-5 h-5" />
            </motion.div>
          </motion.div>
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
    </motion.div>
  )
}
