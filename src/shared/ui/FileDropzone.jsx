import React, { useState, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { UploadCloud } from '@/shared/ui/Icons';
import { validateFile, MAX_SCREENSHOT_SIZE } from '@/shared/lib/fileValidation';
import { Text } from '@/shared/ui/Typography';

export function FileDropzone({
  onFilesDrop,
  accept = 'image/*',
  maxSize = MAX_SCREENSHOT_SIZE,
  multiple = false,
  disabled = false,
  className
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // RelatedTarget check prevents flickering when dragging over children
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragActive) setIsDragActive(true);
  };

  const processFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    
    // If multiple=false, only take the first file
    const filesToProcess = multiple ? Array.from(fileList) : [fileList[0]];
    const validFiles = [];
    const errors = [];

    filesToProcess.forEach(file => {
      const { valid, error } = validateFile(file, { maxSize, accept });
      if (valid) {
        validFiles.push(file);
      } else {
        errors.push({ file, error });
      }
    });

    onFilesDrop(validFiles, errors);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    if (disabled) return;
    processFiles(e.target.files);
    // Reset input so selecting the same file twice triggers onChange
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drag and drop files here, or press Enter to browse"
      aria-disabled={disabled}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer",
        isDragActive 
          ? "border-[var(--accent)] bg-[var(--accent-soft)]" 
          : "border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-hover)]",
        disabled && "opacity-50 cursor-not-allowed hover:border-[var(--color-border-subtle)] hover:bg-transparent",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />
      <UploadCloud className={cn("w-8 h-8 mb-3 transition-colors", isDragActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
      <Text className="text-sm font-medium text-center">
        {isDragActive ? 'Drop file now' : 'Drag file here or click to browse'}
      </Text>
      <Text size="xs" variant="muted" className="mt-1 text-center">
        Maximum size: {maxSize / (1024 * 1024)}MB. 
        {accept && ` Supported: ${accept.split(',').map(a => a.split('/')[1]?.toUpperCase() || a).join(', ')}`}
      </Text>
    </div>
  );
}
