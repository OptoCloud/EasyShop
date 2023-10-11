<script lang="ts">
	import { enhance } from '$app/forms';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { SubmitFunction } from '@sveltejs/kit';

	const toastStore = getToastStore();

	export let data;

	let addItemMenuOpen = false;
	let addingShoppingList = false;

	function ToggleAddMenu() {
		addItemMenuOpen = !addItemMenuOpen;
	}
	const onSubmitShoppingList: SubmitFunction = async (event) => {
		addingShoppingList = true;

		return async ({ update }) => {
			await update();

			addingShoppingList = false;

			toastStore.trigger({
				message: 'Shopping List added successfully!',
				timeout: 5000,
				background: 'variant-filled-primary'
			});
		};
	};
</script>

<svelte:head>
	<title>Easy Shop - Home</title>
</svelte:head>

<div class="flex flex-col items-center justify-center h-full gap-y-4 max-w-[80%] mx-auto">
	<h1 class="h1">Welcome {data?.username}!</h1>
	<p class="p">You are now logged in.</p>

	<button class="btn variant-filled-primary" on:click={ToggleAddMenu}> Add Shopping List </button>
	{#if addItemMenuOpen}
		<form
			class="card flex flex-col gap-y-2 p-4"
			method="POST"
			action="?/addShoppingList"
			use:enhance={onSubmitShoppingList}
		>
			<h2 class="h2">Add Shopping List</h2>

			<label class="label">
				<span>Name</span>
				<input class="input" name="name" type="text" placeholder="Name" required />
			</label>

			<label class="label">
				<span>Description</span>
				<input class="input" name="description" type="text" placeholder="Description" />
			</label>

			<button class="btn variant-filled-primary"> Add Shopping List </button>
		</form>
	{/if}

	<!-- Grid of shopping lists -->
	<div class="grid grid-cols-4 gap-4">
		{#each data?.shoppingLists ?? [] as shoppingList}
			<a
				class="min-h-[7rem] max-w-[20rem] p-4 card flex flex-col gap-y-2"
				href="/home/list/{shoppingList.id}"
			>
				<h2 class="h2 overflow-hidden overflow-ellipsis">{shoppingList.name}</h2>
				<p class="p">{shoppingList.description}</p>
			</a>
		{/each}
	</div>
</div>
