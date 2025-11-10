import type { MapState } from '../types'

import { useCompaniesCache } from '@/composables/useCompaniesCache'

export interface ICategoryManager {
  readonly allCategory: string
  loadCategories(): void
  getBuildingsByCategory(category: string): Array<number | string>
}

export class CompanyCacheCategoryManager implements ICategoryManager {
  readonly allCategory: string

  private buildingIdToCategory: Map<number, Set<string>>
  private categoryToBuildings: Map<string, Set<number | string>>
  private categories: Set<string>

  private state: MapState
  private ready: boolean
  constructor(state: MapState, all: string = 'Todas') {
    this.state = state

    this.categories = new Set()
    this.buildingIdToCategory = new Map()
    this.categoryToBuildings = new Map()
    this.allCategory = all
    this.ready = false
  }

  getBuildingsByCategory(category: string): Array<number | string> {
    if (!this.ready) {
      console.log("[CategoriesManager] CategoriesManager is not ready yet!")
      return []
    }
    if (!this.categories.has(category)) {
      console.log(`[CategoriesManager] Not a valid category: ${category}`)
      return []
    }
    console.log(`[CategoriesManager] Retrieving buildings included in category \"${category}\"`);
    const set = this.categoryToBuildings.get(category) as Set<number | string>
    return Array.from(set) as Array<number | string>
  }

  // TODO - Empresa id 43, BeasyBox, não possui prédio associado no banco de dados!!!!!!!!
  loadCategories(): void {
    if (this.ready) {
        return
    }
    const categoriesSet = new Set<string>()
    this.categoryToBuildings.set(this.allCategory, new Set())
    const companies = useCompaniesCache()!.companies.value
    companies.forEach((company) => {
      company.categories.forEach((category) => {
        categoriesSet.add(category.name)
        if (!this.categoryToBuildings.has(category.name)) {
          this.categoryToBuildings.set(category.name, new Set())
        }
        this.categoryToBuildings.get(category.name)?.add(company.building?.id)

        this.categoryToBuildings.get(this.allCategory)?.add(company.building?.id)
        if (!this.buildingIdToCategory.has(company.building?.id)) {
          this.buildingIdToCategory.set(company.building?.id, new Set())
        }
        this.buildingIdToCategory.get(company.building?.id)?.add(category.name)
      })
    });
    this.categories = categoriesSet
    this.categories.add(this.allCategory)
    // this.categories = [this.allCategory, ...Array.from(categoriesSet).sort() as string[]]
    this.ready = true
  }
}
