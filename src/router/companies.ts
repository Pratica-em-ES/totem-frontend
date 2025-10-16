import { ref, readonly } from 'vue'
import { companyService } from '../services/companyService'
import type { CompanyDTO } from '../models/CompanyDTO'

export function useCompanies() {
  const companies = ref<CompanyDTO[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCompanies = async () => {
    try {
      loading.value = true
      error.value = null
      companies.value = await companyService.getAllCompanies()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar empresas'
      console.error('Erro ao buscar empresas:', err)
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