import { ref, type Ref } from 'vue'

const selectedBuildingId: Ref<number | null> = ref(null)

export function useSelectedBuilding() {
  const setSelectedBuilding = (buildingId: number | null) => {
    selectedBuildingId.value = buildingId
  }

  const clearSelection = () => {
    selectedBuildingId.value = null
  }

  return {
    selectedBuildingId,
    setSelectedBuilding,
    clearSelection
  }
}
