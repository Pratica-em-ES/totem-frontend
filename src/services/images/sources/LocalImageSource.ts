import type { ImageSource } from './ImageSource'

/**
 * Loads images from local public folder
 * Uses relative paths like '/images/company-logo.png'
 * Returns the same path since browser can load local images directly
 */
export class LocalImageSource implements ImageSource {
  getSourceType(): string {
    return 'local'
  }

  async loadImage(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        // For local images, we can just return the path
        // Browser will handle caching automatically
        resolve(imagePath)
      }

      img.onerror = (error) => {
        console.error(`[LocalImageSource] Failed to load image: ${imagePath}`, error)
        reject(new Error(`Failed to load image: ${imagePath}`))
      }

      img.src = imagePath
    })
  }

  async preloadImages(imagePaths: string[]): Promise<void> {
    console.log(`[LocalImageSource] Preloading ${imagePaths.length} images...`)
    const loadPromises = imagePaths.map((path) => this.loadImage(path))
    await Promise.all(loadPromises)
    console.log(`[LocalImageSource] Successfully preloaded ${imagePaths.length} images`)
  }
}
