import { ref, type Ref } from 'vue'
import type { CompanyDTO } from '@/models/CompanyDTO'

// Shared state for the currently selected company
const selectedCompanyId: Ref<number | null> = ref(null)
const selectedCompany: Ref<CompanyDTO | null> = ref(null)

export function useSelectedCompany() {
  const setSelectedCompany = (company: CompanyDTO | null) => {
    if (company) {
      selectedCompanyId.value = company.id
      selectedCompany.value = company
      console.log('[useSelectedCompany] Selected company:', company.name, 'ID:', company.id)
    } else {
      selectedCompanyId.value = null
      selectedCompany.value = null
      console.log('[useSelectedCompany] Cleared selected company')
    }
  }

  const clearSelectedCompany = () => {
    selectedCompanyId.value = null
    selectedCompany.value = null
    console.log('[useSelectedCompany] Cleared selected company')
  }

  return {
    selectedCompanyId,
    selectedCompany,
    setSelectedCompany,
    clearSelectedCompany
  }
}
