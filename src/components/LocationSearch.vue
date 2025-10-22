<template>
  <div class="location-search-container">
    <div class="input-group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <input
        type="text"
        v-model="startPoint"
        placeholder="Ponto de partida"
      />
    </div>

    <div class="input-group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon"
      >
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <input
        type="text"
        v-model="destination"
        placeholder="Destino"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// Reactive variables to hold the input values
const startPoint = ref('Totem Principal do TecnoPuc');
const destination = ref('');

const route = useRoute();

onMounted(() => {
  // Verifica se existe um parâmetro destinoNome na query e preenche o campo de destino
  if (route.query.destinoNome) {
    destination.value = String(route.query.destinoNome);
  }
});
</script>

<style scoped>
/* Scoped styles apply only to this component */

.input-group {
  display: flex;
  align-items: center;
  background-color: #f1f3f4; /* Light gray background similar to the image */
  border-radius: 50px; /* Fully rounded corners */
  padding: 0.75rem 1rem; /* Padding inside the input group */
  transition: box-shadow 0.2s ease-in-out; /* Smooth transition for focus */
}

.input-group:focus-within {
  /* Add a subtle shadow when an input inside is focused */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 20px;
  height: 20px;
  color: #5f6368; /* A neutral, dark gray for the icons */
  flex-shrink: 0; /* Prevents icons from shrinking if space is tight */
}

input {
  flex-grow: 1; /* Allows the input to fill the available space */
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 1rem;
  margin: 0 0.75rem; /* Space between icons and text */
  color: #202124;
}

input::placeholder {
  color: #5f6368;
  opacity: 1; /* Ensure placeholder is fully visible */
}

.location-search-container {
  width: 100%; /* Take full width of the parent */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0 auto; /* Center horizontally */
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #f1f3f4;
  border-radius: 50px;
  padding: 0.75rem 1rem;
  transition: box-shadow 0.2s ease-in-out;
}

.input-group:focus-within {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


.location-search-container {
  width: 100%; /* Take full width of the parent */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0 auto; /* Center horizontally */
  display: flex;
  flex-direction: column; /* Stack the input groups vertically */
  gap: 1rem; /* Add spacing between the input groups */
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #f1f3f4; /* Light gray background */
  border-radius: 50px; /* Fully rounded corners */
  padding: 0.75rem 1rem; /* Padding inside the input group */
  transition: box-shadow 0.2s ease-in-out; /* Smooth transition for focus */
}

.input-group:focus-within {
  /* Add a subtle shadow when an input inside is focused */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 20px;
  height: 20px;
  color: #5f6368; /* Neutral, dark gray for the icons */
  flex-shrink: 0; /* Prevents icons from shrinking if space is tight */
}

input {
  flex-grow: 1; /* Allows the input to fill the available space */
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 1rem;
  margin: 0 0.75rem; /* Space between icons and text */
  color: #202124;
}

input::placeholder {
  color: #5f6368;
  opacity: 1; /* Ensure placeholder is fully visible */
}
</style>
