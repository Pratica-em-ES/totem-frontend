<template>
  <div class="search-wrapper">
    <div class="search" ref="searchContainer">
      <div class="left">
        <DropdownMenuFilter v-model="selectedCategory" :categories="categories" />
      </div>

      <input
        type="text"
        v-model="searchQuery"
        placeholder="Pesquisar"
        @keyup.enter="handleEnter"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @input="handleInput"
        aria-label="Pesquisar"
        ref="searchInput"
      />

      <button
        v-if="searchQuery.length > 0"
        @click="clearInput"
        class="clear-button"
        aria-label="Limpar pesquisa"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <!-- Dropdown with suggestions -->
      <div v-if="showDropdown" class="dropdown-list">
        <div
          v-for="(item, index) in filteredItems"
          :key="item.id"
          :class="['dropdown-item', { highlighted: index === highlightedIndex }]"
          @click="selectItem(item)"
          @mouseenter="highlightedIndex = index"
        >
          <span class="item-icon">
            <!-- SVG Icons based on type -->
            <svg v-if="item.type === 'company'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M13 21V9"/><path d="M9 21v-4h6v4"/></svg>
            <svg v-else-if="item.type === 'building'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M16 18h.01"/></svg>
          </span>
          <div class="item-content">
            <div class="item-name">{{ item.displayName }}</div>
            <div class="item-subtitle">{{ item.subtitle }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted } from "vue";
import DropdownMenuFilter from "./DropdownMenuFilter.vue";
import { useCompaniesCache } from "@/composables/useCompaniesCache";

interface SearchableItem {
  id: string;
  displayName: string;
  subtitle: string;
  nodeId: number;
  buildingId: number;
  type: 'building' | 'company';
  icon: string;
  categories: string[];
}

const emit = defineEmits(["search"]);

// Access shared companies cache
const { companies, fetchCompanies } = useCompaniesCache();

// Local state
const searchQuery = ref("");
const selectedCategory = ref("Todas");
const mapData = ref<any>(null);
const showDropdown = ref(false);
const highlightedIndex = ref(0);
const searchContainer = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const isSelecting = ref(false); // Flag to prevent reopening dropdown on selection

// Derive categories dynamically from cached companies
const categories = computed(() => {
  const set = new Set<string>();
  companies.value.forEach(company => {
    if (Array.isArray(company.categories)) {
      company.categories.forEach(cat => {
        if (typeof cat === 'string') set.add(cat);
        else if (cat && typeof cat.name === 'string') set.add(cat.name);
      });
    }
  });
  return ["Todas", ...Array.from(set).sort()];
});

// Build searchable items from companies cache and map data
const searchableItems = computed<SearchableItem[]>(() => {
  const items: SearchableItem[] = [];

  // Add companies from cache
  companies.value.forEach((company) => {
    // Skip companies without building info
    if (!company.building || !company.building.node) {
      return;
    }

    const companyCats: string[] = [];
    if (Array.isArray(company.categories)) {
      company.categories.forEach(cat => {
        if (typeof cat === 'string') companyCats.push(cat);
        else if (cat && typeof cat.name === 'string') companyCats.push(cat.name);
      });
    }

    items.push({
      id: `company-${company.id}`,
      displayName: company.name,
      subtitle: `${company.building.name}`,
      nodeId: company.building.node.id,
      buildingId: company.building.id,
      type: 'company',
      icon: 'store', // used for logic if needed, but icon is rendered via SVG now
      categories: companyCats
    });
  });

  // Add buildings from map data
  if (mapData.value?.buildings) {
    mapData.value.buildings.forEach((building: any) => {
      items.push({
        id: `building-${building.id}`,
        displayName: building.name,
        subtitle: 'Prédio',
        nodeId: building.nodeId,
        buildingId: building.id,
        type: 'building',
        icon: 'building',
        categories: [] // Buildings don't usually have categories like companies
      });
    });
  }

  return items;
});

// Filter items based on search query and category
const filteredItems = computed<SearchableItem[]>(() => {
  if (!searchQuery.value || searchQuery.value.length < 1) {
    return [];
  }

  const query = searchQuery.value.toLowerCase();
  const category = selectedCategory.value;

  // First filter by category
  let items = searchableItems.value;
  if (category && category !== 'Todas') {
    items = items.filter(item => {
      if (item.type === 'company') {
        return item.categories.includes(category);
      }
      return false;
    });
  }

  // Then filter by query
  return items.filter((item) => {
    return (
      item.displayName.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query)
    );
  }).slice(0, 5); // Top 5 matches
});

onMounted(async () => {
  // ensure default
  if (!selectedCategory.value) selectedCategory.value = "Todas";

  // Load data
  try {
    await fetchCompanies();

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const response = await fetch(`${API_BASE_URL}/map`);
    mapData.value = await response.json();
  } catch (error) {
    console.error('[SearchBar] Error loading data:', error);
  }

  // Click outside listener
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watchers
watch(searchQuery, (newValue) => {
  if (isSelecting.value) {
      showDropdown.value = false;
  } else {
      showDropdown.value = newValue.length > 0 && filteredItems.value.length > 0;
  }
  highlightedIndex.value = 0;
  // Also emit search for real-time filtering if parent uses it (existing behavior)
  emit('search', { query: newValue, category: selectedCategory.value });
});

watch(selectedCategory, (newCategory) => {
  emit('search', { query: searchQuery.value, category: newCategory });
});

watch(filteredItems, (newItems) => {
  // If items change (e.g. category changed) and we are not selecting, update visibility
  if (!isSelecting.value && searchQuery.value.length > 0 && newItems.length > 0) {
    showDropdown.value = true;
  } else if (newItems.length === 0) {
    showDropdown.value = false;
  }
});

// Methods
function handleInput() {
  // User is typing manually, so we are not selecting from dropdown
  isSelecting.value = false;
}

function handleEnter(event: Event) {
  event.preventDefault();
  if (showDropdown.value && filteredItems.value[highlightedIndex.value]) {
    selectItem(filteredItems.value[highlightedIndex.value]);
  } else {
    // Just normal search emit
    emit('search', { query: searchQuery.value, category: selectedCategory.value });
    showDropdown.value = false;
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (!showDropdown.value || filteredItems.value.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredItems.value.length - 1
      );
      break;
    case 'ArrowUp':
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      break;
    case 'Escape':
      showDropdown.value = false;
      break;
  }
}

function handleFocus() {
  if (searchQuery.value.length > 0 && filteredItems.value.length > 0) {
    showDropdown.value = true;
  }
}

function handleClickOutside(event: MouseEvent) {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
}

function selectItem(item: SearchableItem) {
  isSelecting.value = true; // Set flag to prevent watcher from re-opening dropdown
  searchQuery.value = item.displayName;
  showDropdown.value = false;

  // Emit selected item details along with query/category
  emit('search', {
    query: item.displayName,
    category: selectedCategory.value,
    item: item
  });
}

function clearInput() {
  isSelecting.value = false;
  searchQuery.value = "";
  showDropdown.value = false;
  if (searchInput.value) searchInput.value.focus();
}
</script>

<style scoped>
.search-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  margin-right: 22px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(16,24,40,0.06);
  border: 1px solid rgba(0,0,0,0.04);
  max-width: 1105px;
  width: 100%;
  padding-left: 0;
  position: relative; /* For dropdown positioning */
}

.search .left {
  display: flex;
  align-items: center;
  padding-left: 12px;
  padding-right: 8px;
  background: #f3f4f6;
  border-right: 1px solid rgba(0,0,0,0.06);
  margin-left: -1px;
  height: 100%;
  box-sizing: border-box;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

input[type="text"] {
  border: none;
  outline: none;
  flex: 1 1 auto;
  padding: 10px 12px;
  font-size: 14px;
  color: #111827;
  background: transparent;
  min-width: 0; /* Prevents overflow */
}

input::placeholder {
  color: #9ca3af;
}

.clear-button {
  background: none;
  border: none;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
}

.clear-button:hover {
  color: #6b7280;
}

/* Dropdown Styles */
.dropdown-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  animation: slideDown 0.15s ease-out;
  border: 1px solid rgba(0,0,0,0.04);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
  gap: 0.75rem;
}

.dropdown-item:hover,
.dropdown-item.highlighted {
  background-color: #f3f4f6;
}

.dropdown-item:first-child {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.item-content {
  flex-grow: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
