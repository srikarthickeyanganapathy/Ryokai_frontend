import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes safely without style conflicts.
 * @param {...(string|undefined|null|false|0|Record<string, boolean>)} inputs - Class names or clsx compatible objects
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
