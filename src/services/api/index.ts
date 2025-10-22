/**
 * API Services - Centralized API layer
 *
 * Clean Architecture:
 * - Single Responsibility: Each service handles one domain
 * - DRY: No duplicated HTTP logic
 * - Separation of Concerns: API layer separated from UI
 */

import { httpClient } from './http'
import type { CompanyDTO } from '@/models/CompanyDTO'
import type { MapDTO } from '@/models/MapDTO'

/**
 * Company API Service
 */
export const companyApi = {
  getAll: () => httpClient.get<CompanyDTO[]>('/companies')
}

/**
 * Map API Service
 */
export const mapApi = {
  getMapData: () => httpClient.get<MapDTO>('/map')
}

/**
 * Route API Service
 */
export const routeApi = {
  getRoute: (fromBuildingId: number, toBuildingId: number) =>
    httpClient.get<number[]>(`/routes/${fromBuildingId}?toBuildingId=${toBuildingId}`)
}
