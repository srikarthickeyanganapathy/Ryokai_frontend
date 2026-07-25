export const MAX_SCREENSHOT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates a file against size and mime type constraints.
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} [options.maxSize=MAX_SCREENSHOT_SIZE] - Maximum file size in bytes
 * @param {string} [options.accept='image/*'] - Comma separated list of accepted mime types (e.g. 'image/*,application/pdf')
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateFile(file, { maxSize = MAX_SCREENSHOT_SIZE, accept = 'image/*' } = {}) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    const mbSize = (maxSize / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File is too large. Maximum size is ${mbSize}MB.` };
  }

  if (accept) {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(`${baseType}/`);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return { valid: false, error: 'Invalid file type. Please upload a supported format.' };
    }
  }

  return { valid: true, error: null };
}
