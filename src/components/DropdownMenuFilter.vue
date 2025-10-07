<template>
  <div class="dropdown">
    <button class="dropdown-toggle" @click="toggleDropdown">
      <span class="category-text">{{ selectedCategory || "Select category" }}</span>
      <span class="chevron">▼</span>
    </button>

    <ul v-if="open" class="dropdown-menu">
      <li v-for="cat in categories" :key="cat" @click="selectCategory(cat)">
        {{ cat }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
//import { allCategories } from "@/services/categoryService"; // adjust your import

const categories = ref([]);
const selectedCategory = ref("");
const open = ref(false);

function toggleDropdown() {
  open.value = !open.value;
}

function selectCategory(cat) {
  selectedCategory.value = cat;
  open.value = false;
}

onMounted(() => {
  categories.value = ["categoria 1", "categoria 2", "categoria 3"]; 
  // if async: allCategories().then(res => categories.value = res)
});
</script>

<style scoped>
.dropdown {
  font-family: Arial, Helvetica, sans-serif;
  font-size: large;
  position: relative;
  display: inline-block;
  background-color: #ddd;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chevron {
  font-size: 12px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;

  border: 1px solid #ddd;
  list-style: none;
  padding: 4px 0;
  margin: 4px 0 0 0;
  /* width: 150px; */
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.dropdown-menu li {
  padding: 8px 12px;
  cursor: pointer;
  color: black

}

.dropdown-menu li:hover {
  background: #f5f5f5;
  color: black
}

.category-text {
  font-size: 14px;
}
</style>
