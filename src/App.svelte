<svelte:head>
	<title>{docTitle}</title>
</svelte:head>
<header class="ez-header level">
	<div class="level-left is-four-fifths">
		<span on:click={openCloseSideBar} class="menu-button">
			{#if openSideBar}
				<span class="icon icon-item"><i class="fas fa-align-justify"></i></span>
			{:else}
			<span class="icon icon-item"><i class="fas fa-align-justify" data-fa-transform="rotate-90"></i></span>
			{/if}
		</span>
		{docTitle}
	</div>
	<div class="level-right version-selector">
		<label for="version">Version:</label>
		<select id="version" class="seclect-width" bind:value={$globalSelectedVersion} on:change={doSelectVersion}>
			{#each $versionList as version}
				<option value={version}>{version}</option>
			{/each}
		</select>
	</div>
</header>
{#if loadDataComplete}
	<div class="ez-container columns is-gapless">
		<LeftMenu openSideBar={openSideBar} groupList={groupList}/>
		<RightContainer/>
	</div>
{:else}
	<div class="loading-area has-text-primary">数据加载中	<span class="icon is-large"><i class="fas fa-spinner fa-pulse"></i></span></div>
{/if}

<script>
	import { onMount, tick, onDestroy } from 'svelte';
	import axios from 'axios';
	import { globalSelectedVersion, storeData, versionList, activityGroup, activityItem } from './store.js';
	import LeftMenu from './LeftMenu.svelte';
	import RightContainer from './RightContainer.svelte';
	
	let docTitle = 'API Doc';
	let openSideBar = true;
	let groupList = [];
	let loadDataComplete = false;
	let hash = '';

	function openCloseSideBar () {
		openSideBar = !openSideBar
	}

	function doSelectVersion (e) {
		hash = '#';
		initShowItem()
	};

	onMount(() => {
		hash = window.location.hash;
		window.location.hash = '#';
		axios.get('/data/common.json').then((response) => {
			if (response.status === 200) {
				let data = response.data || {};
				storeData.set(data);
				docTitle = data.docTitle;
				versionList.set(data.versionList);
				globalSelectedVersion.set(data.versionList[0]);
				getVersionData()
			} else {
				console.log(response)
			}
		})
		// listen has change
		window.addEventListener('hashchange', handlerHashChange);
	})

	function handlerHashChange () {
		let gethas = window.location.hash.replace(/#/g, '');
		if (gethas) {
			let index = gethas.indexOf('-');
			if (index > 0) {
				activityGroup.set(gethas.substr(0,index));
				activityItem.set(gethas.substr(index + 1));
			} else {
				activityGroup.set(gethas);
				activityItem.set(gethas);
			}
		} else {
			activityGroup.set('');
			activityItem.set('');
		}
	}

	onDestroy(() => {
		// remove listen
		window.removeEventListener('hashchange', handlerHashChange);
	})

	let requestNum = 0;
	function getVersionData () {
		for (let v of $versionList) {
			let url = `/data/${v}/groupInfo.json`;
			storeData.update((data) => {
				data[v] = {};
				return data;
			})
			requestNum += 1;
			axios.get(url).then((response) => {
				if (response.status === 200) {
					let data = response.data || {};
					let groupList = data.group || [];
					getGroupData(v,groupList);
				} else {
					console.log(response)
				}
			}).finally(() => requestNum -= 1)
		}
	}

	function getGroupData (version, groupList) {
		for (let group of groupList) {
			let url = `/data/${version}/${group}.json`;
			storeData.update((data) => {
				data[version][group] = data[version][group] || {};
				return data;
			})
			requestNum += 1;
			axios.get(url).then((response) => {
				if (response.status === 200) {
					storeData.update((data) => {
						data[version][group] = response.data || {};
						return data;
					})
				} else {
					console.log(response)
				}
			}).finally(() => {
				requestNum -= 1;
				if (requestNum === 0) {
					loadDataComplete = true;
					initShowItem();
				}
			})
		}
	}

	async function initShowItem () {
		let groupObject = $storeData[$globalSelectedVersion] || {};
		let groups = [];
		for (let group in groupObject) {
			groups.push({
				groupName: group, 
				subItems: Object.keys(groupObject[group]).map((key) => {
					return {
						title: key,
						description: groupObject[group][key].Name ? groupObject[group][key].Name.description : ''
					}
				})
			})
		}
		groupList = groups;
		await tick();
		hash && (window.location.hash = hash);
	}

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
		margin: 0px;
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
		min-width: 120px;
	}
	.loading-area {
		text-align: center;
	}
	.ez-container {
		position: absolute;
		top: 56px;
		left: 0;
		right: 0;
		bottom: 0;
	}
</style>