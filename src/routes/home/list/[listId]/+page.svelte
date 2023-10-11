<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from './$types.js';

	export let data;

	let addingItem = false;

	const onSubmit: SubmitFunction = async (event) => {
		addingItem = true;

		return async ({ update }) => {
			await update();

			addingItem = false;
		};
	};
</script>

{#if data.shoppingList}
	<div class="h-full py-8 flex-row text-center space-y-12">
		<div>
			<h1 class="h1 mb-4">{data.shoppingList.name}</h1>
			<p>{data.shoppingList.description}</p>
		</div>

		<div class="w-full flex flex-col gap-y-4">
			<!-- Add item form -->
			<form class="flex flex-row gap-x-2" method="POST" action="?/addItem" use:enhance={onSubmit}>
				<label class="label flex-1">
					<input
						class="input"
						name="itemName"
						type="text"
						placeholder="Item Name"
						required
						disabled={addingItem}
					/>
				</label>

				<button class="btn variant-filled-primary" type="submit" disabled={addingItem}>
					{#if addingItem}
						Adding Item...
					{:else}
						Add Item
					{/if}
				</button>
			</form>

			<!-- List of items with checkboxes -->
			<div class="card p-4 flex flex-col items-center justify-center gap-y-4">
				{#if data.shoppingList.items.length > 0}
					{#each data.shoppingList.items as item}
						<div class="flex flex-row items-center justify-between w-full">
							<p class="p">{item.name}</p>
							<input type="checkbox" class="checkbox" />
						</div>
					{/each}
				{:else}
					<p class="p">This shopping list is empty.</p>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<p class="p">You have no shopping lists.</p>
{/if}
