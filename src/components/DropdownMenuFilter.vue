<template>
  <div class="dropdown">
    <button class="dropdown-toggle" @click="toggleDropdown" type="button">
      <span class="category-text">{{ selected }}</span>
      <span class="chevron">▾</span>
    </button>

    <ul v-if="open" class="dropdown-menu" role="menu">
      <li v-for="cat in localCategories" :key="cat" @click="selectCategory(cat)">
        {{ cat }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "Todas" },
  categories: { type: Array, default: () => ["Todas", "Categoria 1", "Categoria 2"] }
});
const emit = defineEmits(["update:modelValue"]);

const open = ref(false);

const localCategories = computed(() => props.categories && props.categories.length ? props.categories : ["Todas"]);
const selected = computed(() => props.modelValue || "Todas");

function toggleDropdown() {
  open.value = !open.value;
}

function selectCategory(cat) {
  emit("update:modelValue", cat);
  open.value = false;
}

// close dropdown on outside click (simple)
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const path = e.composedPath && e.composedPath();
    // if click outside this component, close
    // this is a simple heuristic: check for element with class 'dropdown' in path
    if (open.value && !path.some(el => el.classList && el.classList.contains && el.classList.contains('dropdown'))) {
      open.value = false;
    }
  });
}
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 100%;
}

.dropdown-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 0.75rem; /* remove vertical padding so box is flush */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: auto;
  color: #111827;
}

.chevron {
  font-size: 12px;
  opacity: 0.8;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  list-style: none;
  padding: 6px 0;
  margin: 0;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  border-radius: 8px;
  min-width: 140px;
  z-index: 40;
}

.dropdown-menu li {
  padding: 8px 12px;
  cursor: pointer;
  color: #111827;
}

.dropdown-menu li:hover {
  background: #f8fafc;
}

.category-text {
  font-size: 14px;
  white-space: nowrap;
}
</style>
