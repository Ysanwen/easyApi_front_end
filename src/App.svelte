<svelte:head>
	<title>{docTitle}</title>
</svelte:head>
<header class="ez-header columns is-gapless">
	<div class="column is-four-fifths">
		<span on:click={openCloseSideBar} class="menu-button">
			{#if openSideBar}
				<span class="icon icon-item"><i class="fas fa-align-justify"></i></span>
			{:else}
			<span class="icon icon-item"><i class="fas fa-align-justify" data-fa-transform="rotate-90"></i></span>
			{/if}
		</span>
		{docTitle}
	</div>
	<div class="column version-selector">
		<label for="version">Version:</label>
		<select id="version" class="seclect-width">
			<option>v1.0.0</option>
			<option>v1.0.1</option>
			<option>v1.0.2</option>
		</select>
	</div>
</header>
<div class="ez-container columns is-gapless">
	<LeftMenu openSideBar={openSideBar} newGroup={newGroup}/>
	<RightContainer on:addGroup={addGroup}/>
</div>

<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import LeftMenu from './LeftMenu.svelte';
	import RightContainer from './RightContainer.svelte';
	
	let docTitle = 'API Doc';
	let openSideBar = true;
	let newGroup = [];

	function openCloseSideBar () {
		openSideBar = !openSideBar
	}

	function addGroup (event) {
		newGroup = [{
			groupName: 'group1', 
			subItems: [
				{title: 'getOne', description: '获取xxxx'},
				{title: 'postTwo', description: '提交xxxx'},
			]
		}];
	}

	onMount(() => {
		axios.get('/data/common.json').then((response) => {
			if (response.status === 200) {
				let data = response.data || {};
				console.log(data);
				docTitle = data.docTitle
			} else {
				console.log(response)
			}
		})
	})

</script>

<style>
	.ez-header {
		position: relative;
		height: 56px;
		line-height: 56px;
		background:#4DB6AC;
		font-size: 18px;
		color: #fff;
		padding: 0px 16px;
	}
	.menu-button {
		margin-right: 8px;
		opacity: 0.7;
		cursor: pointer;
	}
	.menu-button:hover {
		opacity: 1;
	}
	.icon-item {
		display: inline-block;
	}
	.version-selector {
		color: #666;
	}
	#version {
		font-size: 14px;
		color: #666;
		margin-left: 8px;
	}
	.seclect-width {
		min-width: 50%;
	}
	.ez-container {
		position: absolute;
		top: 56px;
		left: 0;
		right: 0;
		bottom: 0;
	}
</style>