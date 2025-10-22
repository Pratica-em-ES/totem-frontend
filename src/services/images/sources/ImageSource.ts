/**
 * Interface for different image loading strategies
 */
export interface ImageSource {
  /**
   * Load an image from the configured source
   * @param imagePath - The path/identifier of the image
   * @returns Promise that resolves to the image URL (data URL or object URL)
   */
  loadImage(imagePath: string): Promise<string>

  /**
   * Optional: Preload multiple images in parallel
   * @param imagePaths - Array of image paths to preload
   */
  preloadImages?(imagePaths: string[]): Promise<void>

  /**
   * Get a unique identifier for this source type
   */
  getSourceType(): string

  /**
   * Optional: Cleanup resources (revoke object URLs, etc.)
   */
  cleanup?(): void
}
