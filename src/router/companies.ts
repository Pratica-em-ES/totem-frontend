import { ref, readonly } from 'vue'
import { companyApi } from '../services/api'
import type { CompanyDTO } from '../models/CompanyDTO'

export function useCompanies() {
  const companies = ref<CompanyDTO[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCompanies = async () => {
    try {
      loading.value = true
      error.value = null
      companies.value = await companyApi.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load companies'
      console.error('[useCompanies] Error fetching companies:', err)
    } finally {
      loading.value = false
    }
  }
  
  return {
    companies: readonly(companies),
    loading: readonly(loading),
    error: readonly(error),
    fetchCompanies
  }
}
