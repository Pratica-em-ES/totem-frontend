<template>
  <div class="search-wrapper">
    <div class="search">
      <div class="left">
        <DropdownMenuFilter v-model="selectedCategory" :categories="categories" />
      </div>

      <input
        type="text"
        v-model="searchQuery"
        placeholder="Pesquisar"
        @keyup.enter="onSearch"
        aria-label="Pesquisar"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import DropdownMenuFilter from "./DropdownMenuFilter.vue";

const props = defineProps({
  categoriesProp: { type: Array, default: () => ["Todas", "Instituição", "Serviço", "Outro"] }
});
const emit = defineEmits(["search"]);

const categories = ref(props.categoriesProp);
const selectedCategory = ref("Todas");
const searchQuery = ref("");

onMounted(() => {
  // ensure default
  if (!selectedCategory.value) selectedCategory.value = "Todas";
});

// Emitir busca em tempo real quando o usuário digita
watch(searchQuery, (newQuery) => {
  emit('search', { query: newQuery, category: selectedCategory.value });
});

// Emitir busca quando a categoria muda
watch(selectedCategory, (newCategory) => {
  emit('search', { query: searchQuery.value, category: newCategory });
});

function onSearch() {
  emit('search', { query: searchQuery.value, category: selectedCategory.value });
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
}

input::placeholder {
  color: #9ca3af;
}

.search-btn {
  background: #D2AB66;
  border: none;
  color: white;
  padding: 10px 12px;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover { filter: brightness(0.95); }

.search-btn svg { display: block; }
</style>