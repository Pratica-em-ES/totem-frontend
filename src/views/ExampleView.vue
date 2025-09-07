
<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue'
</script>

<template>
	<main class="screen">
		<SideMenu />
		<section class="content">
			<EmptyPlaceholder />
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

</style>
