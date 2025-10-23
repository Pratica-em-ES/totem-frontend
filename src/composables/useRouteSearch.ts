import { ref, computed } from 'vue'
import { useCompaniesCache } from './useCompaniesCache'
import { useCurrentLocation } from './useCurrentLocation'
import { mapApi, routeApi } from '@/services/api'

export interface SearchResult {
  id: string
  name: string
  type: 'building' | 'company' | 'totem'
  nodeId: number
  buildingId: number | null
  buildingName?: string
  floor?: string
}

const allSearchResults = ref<SearchResult[]>([])
const isDataLoaded = ref(false)

export function useRouteSearch() {
  const { companies, fetchCompanies } = useCompaniesCache()
  const { currentLocation } = useCurrentLocation()

  // Load and build search index
  const loadSearchData = async () => {
    if (isDataLoaded.value) {
      console.log('[RouteSearch] Data already loaded')
      return
    }

    console.log('[RouteSearch] Loading search data...')

    try {
      // Fetch companies
      await fetchCompanies()
      console.log('[RouteSearch] Companies loaded:', companies.value.length)

      // Fetch map data
      const mapData = await mapApi.getMapData()
      console.log('[RouteSearch] Map loaded, buildings:', mapData.buildings.length)

      const results: SearchResult[] = []

      // Add buildings
      mapData.buildings.forEach((building: any) => {
        results.push({
          id: `building-${building.id}`,
          name: building.name,
          type: 'building',
          nodeId: building.nodeId,
          buildingId: building.id
        })
      })

      // Add companies
      companies.value.forEach((company) => {
        results.push({
          id: `company-${company.id}`,
          name: company.name,
          type: 'company',
          nodeId: company.building.node.id,
          buildingId: company.building.id,
          buildingName: company.building.name
        })
      })

      allSearchResults.value = results
      isDataLoaded.value = true
      console.log('[RouteSearch] Total search results indexed:', results.length)
    } catch (error) {
      console.error('[RouteSearch] Error loading data:', error)
      throw error
    }
  }

  // Search destinations by query
  const searchDestinations = (query: string, limit = 5): SearchResult[] => {
    if (!query.trim()) {
      return []
    }

    const searchTerm = query.toLowerCase().trim()

    return allSearchResults.value
      .filter((result) => {
        const nameMatch = result.name.toLowerCase().includes(searchTerm)
        const buildingMatch = result.buildingName?.toLowerCase().includes(searchTerm)
        return nameMatch || buildingMatch
      })
      .slice(0, limit)
  }

  // Fetch route from backend
  const fetchRoute = async (fromBuildingId: number, toBuildingId: number): Promise<number[]> => {
    return await routeApi.getRoute(fromBuildingId, toBuildingId)
  }

  return {
    currentLocation,
    loadSearchData,
    searchDestinations,
    fetchRoute,
    isDataLoaded: computed(() => isDataLoaded.value)
  }
}
