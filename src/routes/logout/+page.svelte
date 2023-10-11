<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getToastStore } from '@skeletonlabs/skeleton';

	if (browser) {
		getToastStore().trigger({
			message: 'Logged out successfully!',
			timeout: 10000,
			background: 'variant-filled-primary'
		});

		goto('/');
	}
</script>
