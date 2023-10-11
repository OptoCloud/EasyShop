<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { SubmitFunction } from '@sveltejs/kit';

	const toastStore = getToastStore();

	export let form;

	let creating = false;

	const onSubmit: SubmitFunction = async (event) => {
		creating = true;

		return async ({ update }) => {
			await update();

			creating = false;
		};
	};

	$: if (form?.success) {
		toastStore.trigger({
			message: 'Account created successfully!',
			timeout: 10000,
			background: 'variant-filled-primary'
		});
		goto('/login');
	}
</script>

<svelte:head>
	<title>Easy Shop - Register</title>
</svelte:head>

<form class="card p-4 flex-row space-y-2" method="POST" use:enhance={onSubmit}>
	<h2 class="h2">Register</h2>

	<label class="label">
		<span>Username</span>
		<input
			class="input"
			name="username"
			type="text"
			placeholder="Username"
			value={form?.username ?? ''}
			autocomplete="name"
			required
			disabled={creating}
		/>
	</label>

	<label class="label">
		<span>Email</span>
		<input
			class="input"
			name="email"
			type="text"
			placeholder="Email"
			value={form?.email ?? ''}
			autocomplete="email"
			required
			disabled={creating}
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
			disabled={creating}
		/>
	</label>

	{#if form?.error}
		<p class="text-red-500">{form.error}</p>
	{/if}

	<button class="btn variant-filled w-full" disabled={creating}>Register</button>
</form>
