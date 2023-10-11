<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { SubmitFunction } from '@sveltejs/kit';

	const toastStore = getToastStore();

	export let form;

	let loggingIn = false;

	const onSubmit: SubmitFunction = async (event) => {
		loggingIn = true;

		return async ({ update }) => {
			await update();

			loggingIn = false;
		};
	};
</script>

<svelte:head>
	<title>Easy Shop - Login</title>
</svelte:head>

<form class="card p-4 flex-row space-y-2" method="POST" use:enhance={onSubmit}>
	<h2 class="h2">Login</h2>

	<label class="label">
		<span>Username or Email</span>
		<input
			class="input"
			name="usernameOrEmail"
			type="text"
			placeholder="Username or Email"
			value={form?.usernameOrEmail ?? ''}
			required
			disabled={loggingIn}
		/>
	</label>

	<label class="label">
		<span>Password</span>
		<input
			class="input"
			name="password"
			type="password"
			placeholder="Password"
			autocomplete="new-password"
			required
			disabled={loggingIn}
		/>
	</label>

	{#if form?.error}
		<p class="text-red-500">{form.error}</p>
	{/if}

	<button class="btn variant-filled w-full" disabled={loggingIn}>Login</button>
</form>
