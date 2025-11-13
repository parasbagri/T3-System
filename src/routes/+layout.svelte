<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { user, isAuthenticated } from '$lib/stores.js';
	import '../app.css';

	let loading = true;

	onMount(async () => {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const data = await response.json();
				user.set(data.user);
				isAuthenticated.set(true);
			} else {
				user.set(null);
				isAuthenticated.set(false);
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			user.set(null);
			isAuthenticated.set(false);
		} finally {
			loading = false;
		}
	});

	$: isAuthPage = $page.url.pathname === '/login' || $page.url.pathname === '/register';
</script>

<div class="app-container">
	{#if !loading}
		{#if $isAuthenticated && !isAuthPage}
			<nav class="navbar">
				<div class="nav-content">
					<a href="/" class="nav-logo">Task Timer</a>
					<div class="nav-links">
						<a href="/" class="nav-link" class:active={$page.url.pathname === '/'}>Tasks</a>
						<a href="/summary" class="nav-link" class:active={$page.url.pathname === '/summary'}>Daily Summary</a>
						<span class="nav-user">Hello, {$user?.name}</span>
						<a href="/logout" class="nav-link" class:active={$page.url.pathname === '/logout'}>Logout</a>
					</div>
				</div>
			</nav>
		{/if}
		<main class="main-content">
			<slot />
		</main>
	{/if}
</div>

<style>
	/* Main App Layout */
	.app-container {
		min-height: 100vh;
	}

	.navbar {
		background: var(--bg-card);
		padding: var(--space-4) var(--space-8);
		border-bottom: 1px solid var(--border-primary);
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: var(--shadow-sm);
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nav-logo {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-primary);
		text-decoration: none;
		transition: var(--transition);
		position: relative;
	}

	.nav-logo::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 0;
		height: 2px;
		background: var(--primary);
		transition: width 0.3s ease;
	}

	.nav-logo:hover::after {
		width: 100%;
	}

	.nav-logo:hover {
		color: var(--primary);
	}

	.nav-links {
		display: flex;
		gap: var(--space-6);
		align-items: center;
	}

	.nav-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		transition: var(--transition);
		position: relative;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius);
		font-size: 0.95rem;
	}

	.nav-link:hover {
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.nav-link.active {
		color: var(--primary);
		background: rgba(99, 102, 241, 0.1);
	}

	.nav-user {
		color: var(--text-secondary);
		font-size: 0.9rem;
		padding: var(--space-2) var(--space-4);
		background: var(--bg-secondary);
		border-radius: var(--radius-full);
		border: 1px solid var(--border-primary);
	}

	.main-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.nav-content {
			flex-direction: column;
			gap: var(--space-4);
		}

		.nav-links {
			flex-wrap: wrap;
			justify-content: center;
			gap: var(--space-4);
		}

		.nav-link {
			font-size: 0.9rem;
		}
	}
</style>
