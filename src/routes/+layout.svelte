<script lang="ts">
	import '../app.postcss';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppBar, Toast, initializeStores, storePopup } from '@skeletonlabs/skeleton';

	export let data;

	// Initialize svelte stores, this is needed for popups and toast notifications
	initializeStores();
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<!-- This is needed in root layout to display toast notifications -->
<Toast position={'bl'} />

<div class="h-full flex flex-col">
	<!-- App bar at the top of the page -->
	<AppBar>
		<!-- Leftmost content, will display the app name and redirect to the appropiate home page -->
		<svelte:fragment slot="lead">
			<a href={data.authenticated ? '/home' : '/'} class="text-white font-bold text-xl">EasyShop</a>
		</svelte:fragment>

		<!-- Rightmost content, will display login/logout buttons depending on the user's authentication status -->
		<svelte:fragment slot="trail">
			{#if data.authenticated}
				<a href="/logout" class="btn variant-filled" data-sveltekit-preload-data="tap">Logout</a>
			{:else}
				<a href="/login" class="btn variant-filled">Login</a>
				<a href="/register" class="btn variant-filled">Register</a>
			{/if}
		</svelte:fragment>
	</AppBar>

	<!-- Main content of the page -->
	<div class="flex-1 flex justify-center items-center p-auto">
		<slot />
	</div>
</div>
