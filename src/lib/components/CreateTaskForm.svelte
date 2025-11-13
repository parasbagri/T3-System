<script>
	import { createEventDispatcher } from 'svelte';
	import './CreateTaskForm.css';

	const dispatch = createEventDispatcher();

	let userInput = '';
	let title = '';
	let description = '';
	let useAI = false;
	let loading = false;
	let error = '';

	async function enhanceWithAI() {
		console.log('Enhance with AI clicked:', userInput);
		if (!userInput.trim()) return;

		loading = true;
		error = '';
		try {
			const response = await fetch('/api/tasks/ai-enhance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userInput })
			});

			if (response.ok) {
				const data = await response.json();
				title = data.title || userInput;
				description = data.description || '';
			} else {
				error = 'Failed to enhance task';
			}
		} catch (err) {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	async function handleSubmit() {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description: description || null
				})
			});

			if (response.ok) {
				userInput = '';
				title = '';
				description = '';
				useAI = false;
				dispatch('taskCreated');
			} else {
				const data = await response.json();
				error = data.error || 'Failed to create task';
			}
		} catch (err) {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="create-task-card">
	<h2>Create New Task</h2>
	
	<div class="ai-section">
		<label class="ai-checkbox">
			<input type="checkbox" bind:checked={useAI} />
			<span class="checkmark"></span>
			Use AI to enhance task
		</label>
	</div>

	{#if useAI}
		<div class="form-group">
			<label for="userInput">Describe your task (natural language)</label>
			<textarea
				id="userInput"
				bind:value={userInput}
				placeholder="e.g., follow up with designer"
				disabled={loading}
				rows="2"
			></textarea>
			<button
				type="button"
				on:click={enhanceWithAI}
				disabled={loading || !userInput.trim()}
				class="btn btn-secondary"
			>
				{loading ? 'Enhancing...' : 'Enhance with AI'}
			</button>
		</div>
	{/if}

	<div class="form-group">
		<label for="title">Task Title *</label>
		<input
			type="text"
			id="title"
			bind:value={title}
			placeholder="Enter task title"
			required
			disabled={loading}
		/>
	</div>

	<div class="form-group">
		<label for="description">Description</label>
		<textarea
			id="description"
			bind:value={description}
			placeholder="Enter task description (optional)"
			disabled={loading}
			rows="3"
		></textarea>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	<button
		type="button"
		on:click={handleSubmit}
		disabled={loading || !title.trim()}
		class="btn btn-primary"
	>
		{loading ? 'Creating...' : 'Create Task'}
	</button>
</div>