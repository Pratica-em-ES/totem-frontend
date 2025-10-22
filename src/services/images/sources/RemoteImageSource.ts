import type { ImageSource } from './ImageSource'

/**
 * Loads images from remote URLs
 * Expects full URLs like 'https://cdn.example.com/images/logo.png'
 * or uses a base URL + relative path
 * Converts images to object URLs for better caching and CORS handling
 */
export class RemoteImageSource implements ImageSource {
  private baseUrl: string
  private objectUrls: Set<string> = new Set()

  /**
   * @param baseUrl - Base URL for images. If provided, imagePath will be appended to it.
   *                  Example: 'https://cdn.example.com/images'
   *                  If empty, imagePath must be a full URL
   */
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  }

  getSourceType(): string {
    return 'remote'
  }

  /**
   * Resolve the full URL for an image
   */
  private resolveUrl(imagePath: string): string {
    // If imagePath is already a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }

    // Otherwise, combine with base URL
    if (this.baseUrl) {
      const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
      return `${this.baseUrl}${path}`
    }

    // If no base URL and not a full URL, throw error
    throw new Error(
      `[RemoteImageSource] Invalid image path: ${imagePath}. Must be a full URL or baseUrl must be configured.`
    )
  }

  async loadImage(imagePath: string): Promise<string> {
    const url = this.resolveUrl(imagePath)

    try {
      // Fetch the image as a blob
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()

      // Create an object URL from the blob
      const objectUrl = URL.createObjectURL(blob)

      // Track object URLs for cleanup
      this.objectUrls.add(objectUrl)

      console.log(`[RemoteImageSource] Loaded image: ${imagePath}`)
      return objectUrl
    } catch (error) {
      console.error(`[RemoteImageSource] Failed to load image from: ${url}`, error)
      throw error
    }
  }

  async preloadImages(imagePaths: string[]): Promise<void> {
    console.log(`[RemoteImageSource] Preloading ${imagePaths.length} images from remote...`)
    const loadPromises = imagePaths.map((path) => this.loadImage(path))
    await Promise.all(loadPromises)
    console.log(`[RemoteImageSource] Successfully preloaded ${imagePaths.length} images`)
  }

  /**
   * Clean up object URLs to free memory
   * Call this when switching sources or unmounting
   */
  cleanup(): void {
    console.log(`[RemoteImageSource] Cleaning up ${this.objectUrls.size} object URLs`)
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url))
    this.objectUrls.clear()
  }
}
