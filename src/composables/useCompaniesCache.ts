import { ref, type Ref } from 'vue'
import type { CompanyDTO } from '@/models/CompanyDTO'
import { companyApi } from '@/services/api'

// Shared state across all components
const companiesCache: Ref<CompanyDTO[]> = ref([])
const loading: Ref<boolean> = ref(false)
const error: Ref<string | null> = ref(null)
const lastFetchTime: Ref<number | null> = ref(null)

export function useCompaniesCache() {
  const fetchCompanies = async (forceRefresh = false) => {
    // Use cached data if available and not forcing refresh
    if (companiesCache.value.length > 0 && !forceRefresh) {
      console.log('[CompaniesCache] Using cached data:', companiesCache.value.length, 'companies')
      loading.value = false
      return companiesCache.value
    }

    console.log('[CompaniesCache] Fetching companies from API...')
    loading.value = true
    error.value = null

    try {
      const companies = await companyApi.getAll()
      console.log('[CompaniesCache] Companies received:', companies.length)
      companiesCache.value = companies
      lastFetchTime.value = Date.now()
      loading.value = false
      return companies
    } catch (err) {
      console.error('[CompaniesCache] Error fetching companies:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load companies'
      loading.value = false
      throw err
    }
  }

  const clearCache = () => {
    companiesCache.value = []
    lastFetchTime.value = null
    error.value = null
  }

  return {
    companies: companiesCache,
    loading,
    error,
    lastFetchTime,
    fetchCompanies,
    clearCache
  }
}
