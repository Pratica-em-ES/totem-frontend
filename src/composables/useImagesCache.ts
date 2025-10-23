import { ref } from 'vue'
import type { ImageSource } from '@/services/images/sources/ImageSource'
import { LocalImageSource } from '@/services/images/sources/LocalImageSource'
import { RemoteImageSource } from '@/services/images/sources/RemoteImageSource'
import { companyApi } from '@/services/api'

// Global cache - shared across the entire application
const imagesCache = ref<Map<string, string>>(new Map())
const isLoaded = ref(false)
const isLoading = ref(false)

// Image source configuration
let imageSource: ImageSource = new LocalImageSource()

/**
 * Composable for managing global images cache
 * Images are fetched once during app initialization and cached
 */
export function useImagesCache() {
  /**
   * Configure the image source strategy
   * @param source - ImageSource instance (LocalImageSource or RemoteImageSource)
   */
  const configureImageSource = (source: ImageSource) => {
    console.log(`[useImagesCache] Configuring image source: ${source.getSourceType()}`)

    // Cleanup old source if needed
    if (imageSource.cleanup) {
      imageSource.cleanup()
    }

    imageSource = source

    // Clear cache when changing source
    imagesCache.value.clear()
    isLoaded.value = false
  }

  /**
   * Set to use local images (default)
   */
  const useLocalImages = () => {
    configureImageSource(new LocalImageSource())
  }

  /**
   * Set to use remote images
   * @param baseUrl - Base URL for remote images
   */
  const useRemoteImages = (baseUrl: string) => {
    configureImageSource(new RemoteImageSource(baseUrl))
  }

  /**
   * Fetch and cache all images from the companies data
   * This should be called once during app initialization
   */
  const fetchImages = async (): Promise<void> => {
    if (isLoaded.value || isLoading.value) {
      console.log('[useImagesCache] Images already loaded or loading')
      return
    }

    try {
      isLoading.value = true
      console.log('[useImagesCache] Starting images preload...')

      // Fetch companies data to get all image paths
      const companies = await companyApi.getAll()
      const imagePaths = companies
        .map((company) => company.imagePath)
        .filter((path) => path && path.trim() !== '') // Filter out empty paths
      const uniquePaths = [...new Set(imagePaths)]

      console.log(`[useImagesCache] Found ${uniquePaths.length} unique images to load`)

      if (uniquePaths.length === 0) {
        console.log('[useImagesCache] No images to cache')
        isLoaded.value = true
        return
      }

      // Load all images in parallel
      const loadPromises = uniquePaths.map(async (path) => {
        try {
          const imageUrl = await imageSource.loadImage(path)
          imagesCache.value.set(path, imageUrl)
          console.log(`[useImagesCache] Cached image: ${path}`)
        } catch (error) {
          console.error(`[useImagesCache] Failed to load image: ${path}`, error)
          // Don't throw - continue loading other images
        }
      })

      await Promise.all(loadPromises)

      isLoaded.value = true
      console.log(`[useImagesCache] Successfully cached ${imagesCache.value.size} images`)
    } catch (error) {
      console.error('[useImagesCache] Error loading images:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a cached image URL by path
   * Returns the cached URL or null if not found
   */
  const getImage = (imagePath: string): string | null => {
    if (!imagePath || imagePath.trim() === '') {
      return null
    }

    const cached = imagesCache.value.get(imagePath)
    if (!cached) {
      console.warn(`[useImagesCache] Image not found in cache: ${imagePath}`)
      return null
    }
    return cached
  }

  /**
   * Check if an image exists in cache
   */
  const hasImage = (imagePath: string): boolean => {
    return imagesCache.value.has(imagePath)
  }

  /**
   * Get cache statistics
   */
  const getCacheStats = () => {
    return {
      size: imagesCache.value.size,
      isLoaded: isLoaded.value,
      isLoading: isLoading.value,
      sourceType: imageSource.getSourceType(),
      cachedPaths: Array.from(imagesCache.value.keys())
    }
  }

  /**
   * Clear the cache
   */
  const clearCache = () => {
    // Cleanup old source if needed
    if (imageSource.cleanup) {
      imageSource.cleanup()
    }

    imagesCache.value.clear()
    isLoaded.value = false
    console.log('[useImagesCache] Cache cleared')
  }

  return {
    // State
    isLoaded,
    isLoading,

    // Configuration
    configureImageSource,
    useLocalImages,
    useRemoteImages,

    // Operations
    fetchImages,
    getImage,
    hasImage,
    getCacheStats,
    clearCache
  }
}
