<template>
  <div class="flex items-stretch border rounded overflow-hidden **w-fit** max-w-xl search">
    <DropdownMenuFilter class = "dropdown flex-none"/>

    <input
      type="text"
      v-model="searchQuery"
      placeholder="Pesquisar"
      class="flex-1 outline-none"
    />

    <button
      @click="onSearch"
      class="bg-yellow-600 text-white flex-none hover:bg-yellow-700"
    >
      🔍
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import DropdownMenuFilter from "./DropdownMenuFilter.vue";
//import { allCategories } from "@/services/categoryService"; // adjust your import

const categories = ref([]);
const selectedCategory = ref("all");
const searchQuery = ref("");

// load categories
onMounted(() => {
  categories.value = ["Todas", "Categoria 1", "Categoria 2"];
  // if async: allCategories().then(res => categories.value = res)
});

// search action
function onSearch() {
  console.log("Searching:", searchQuery.value, "in", selectedCategory.value);
  // emit event or call API here
}
</script>

<style scoped>
/* Optional: you can adjust styles without Tailwind if not using it */
.search {
  border: solid #ddd 1px;
  height: 10%;
  width: fit-content;
  box-sizing: border-box;
}

input {
  font-size: 1rem;
  border: none;
  width: 120vh;
  padding-left: 16px;
  padding-right: 16px;
  flex-grow: 1;
}

input:focus {
  outline: none;
}

input:active {
  outline: none;
}

button {
  cursor: pointer;
  border: none;
  height: 100%;
  width: 6vh;
  background-color: #D2AB66;
}

.dropdown {
  height: 100%;
}
</style>
