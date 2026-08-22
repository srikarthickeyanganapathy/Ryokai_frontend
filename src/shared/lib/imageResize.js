/**
 * Downscales an image file with a canvas before upload.
 * Keeps avatars/attachments small — the backend caps avatars at 2MB and
 * stores them base64-encoded, so a raw phone photo would be rejected.
 *
 * @param {File} file - image file to resize
 * @param {number} maxDim - longest edge in pixels (default 512)
 * @param {number} quality - JPEG quality 0..1 (default 0.85)
 * @returns {Promise<File>} resized image as a JPEG file
 */
export function resizeImageFile(file, maxDim = 512, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      // Animated GIFs and non-images pass through untouched
      resolve(file)
      return
    }
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not load image'))
    }
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl)
            if (!blob) {
              reject(new Error('Could not encode image'))
              return
            }
            const baseName = (file.name || 'avatar').replace(/\.[^.]+$/, '')
            resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          quality
        )
      } catch (err) {
        URL.revokeObjectURL(objectUrl)
        reject(err)
      }
    }
    img.src = objectUrl
  })
}
