
<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue'
import MapRenderer from '@/components/MapRenderer.vue';
</script>

<template>
	<main class="screen">
		<SideMenu />
		<section class="content">
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
