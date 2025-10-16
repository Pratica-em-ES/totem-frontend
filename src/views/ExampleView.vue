
<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue'
import MapRenderer from '@/components/MapRenderer.vue';
import LocationSearch from '@/components/LocationSearch.vue';
</script>

<template>
	<main class="screen">
		<div class="aligned-container">
			<SideMenu />
		</div>
		<section class="content">
			<LocationSearch />
			<!-- <EmptyPlaceholder /> -->
			<div class="map-renderer">
      			<MapRenderer />
   	 		</div>
		</section>
	</main>
</template>

<style scoped>
.screen {
	min-height: 100dvh;
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 1.25rem;
	padding: 1rem 1.25rem;
}
.content {
	display: flex;
	flex-direction: column;
	height: 100%;
}

/* os valores podem ser ajustados livremente */
.map-renderer {
  position: relative;
  /* bottom: 5%; */
  /* right: 2.5%; */
  /* valores com uma cara bastante arbitraria kk (mudar para algo melhor caso precise) */
  top: 13%;
  left: 1.6%;
  width: 96%;
  height: 79%;
  /* border: 1px solid red; */
}

</style>

<style scoped>
.screen {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
}

.content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1.6%;
  padding: 0.5rem; /* Match the map's horizontal padding */
}

.map-renderer {
  position: relative;
  top: 5%;
  width: 96%; /* Match the width calculation */
  height: 79%;
}

.aligned-container {
  width: 96%; /* Match the map's width */
  margin: 0 auto; /* Center horizontally */
}
</style>
