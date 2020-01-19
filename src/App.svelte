<svelte:head>
	<title>{docTitle}</title>
</svelte:head>
<header class="ez-header level">
	<div class="level-left">
		<span on:click={openCloseSideBar} class="menu-button">
			{#if openSideBar}
				<span class="icon icon-item"><i class="fas fa-align-justify"></i></span>
			{:else}
			<span class="icon icon-item"><i class="fas fa-align-justify" data-fa-transform="rotate-90"></i></span>
			{/if}
		</span>
		{docTitle}
		<span class="version-selector">
			<label for="version">{$lang.version}:</label>
			<select id="version" class="seclect-width" bind:value={$globalSelectedVersion} on:change={doSelectVersion}>
				{#each $versionList as version}
					<option value={version}>{version}</option>
				{/each}
			</select>
		</span>
	</div>
	<div class="level-right version-selector">
	<!-- lang -->
		<select class="seclect-width" bind:value={languageKey}>
				{#each languageList as language}
					<option value={language.languageKey}>{language.languageName}</option>
				{/each}
			</select>
	</div>
</header>
{#if loadDataComplete}
	<div class="ez-container columns is-gapless">
		<LeftMenu openSideBar={openSideBar} groupList={groupList}/>
		<RightContainer/>
	</div>
{:else if errorMsg}
	<article class="message is-warning">
		<div class="message-header">
			<p>{lang.warning}</p>
		</div>
		<div class="message-body">
			<pre class="message-body-pre">{errorMsg}</pre>
		</div>
	</article>
{:else}
	<div class="loading-area has-text-primary">{lang.loading}	<span class="icon is-large"><i class="fas fa-spinner fa-pulse"></i></span></div>
{/if}

<script>
	import { onMount, tick, onDestroy } from 'svelte';
	import {fetch} from 'whatwg-fetch';
	import { languageList, getLang } from './lang/index.js';
	import { globalSelectedVersion, storeData, versionList, activityGroup, activityItem, lang } from './store.js';
	import LeftMenu from './LeftMenu.svelte';
	import RightContainer from './RightContainer.svelte';

	let languageKey = 'zhCn';
	let docTitle = 'API Doc';
	let openSideBar = true;
	let groupList = [];
	let loadDataComplete = false;
	let hash = '';
	let errorMsg = '';

	$: if (languageKey) {
		lang.set(getLang(languageKey));
	}

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

		fetch('data/common.json', {credentials: 'same-origin', method: 'GET'}).then((response) => {
			if (response.status === 200) {
				return response.json();
			} else {
				throw new Error(response.statusText)
			}
		}).then((data) => {
			storeData.set(data);
			docTitle = data.docTitle;
			versionList.set(data.versionList);
			globalSelectedVersion.set(data.versionList[0]);
			getVersionData()
		}).catch((error) => {
      errorMsg = 'load common.json fail: ' + error.message + '\n';
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
			let url = `data/${v}/groupInfo.json`;
			storeData.update((data) => {
				data[v] = {};
				return data;
			})
			requestNum += 1;

			fetch(url, {credentials: 'same-origin', method: 'GET'}).then((response) => {
				if (response.status === 200) {
					return response.json();
				} else {
					throw new Error(response.statusText)
				}
			}).then((data) => {
				let groupList = data.group || [];
				getGroupData(v,groupList);
			}).catch((error) => {
				errorMsg += `load ${v}/groupInfo.json fail: ` + error.message + '\n';
			}).finally(() => requestNum -= 1)
		}
	}

	function getGroupData (version, groupList) {
		for (let group of groupList) {
			let url = `data/${version}/${group}.json`;
			storeData.update((data) => {
				data[version][group] = data[version][group] || {};
				return data;
			})
			requestNum += 1;
			fetch(url, {credentials: 'same-origin', method: 'GET'}).then((response) => {
				if (response.status === 200) {
					return response.json();
				} else {
					throw new Error(response.statusText)
				}
			}).then((responseData) => {
				storeData.update((data) => {
					data[version][group] = responseData || {};
					return data;
				})
			}).catch((error) => {
			errorMsg += `load ${v}/${group}.json fail: ` + error.message + '\n';
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
		margin-left: 10px;
	}
	.seclect-width {
		font-size: 14px;
		color: #666;
		margin-left: 8px;
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
	.message {
		margin-top: 3rem;
    width: 40rem;
    margin-left: auto;
    margin-right: auto;
	}
	.message-body-pre {
		background: inherit;
	}
</style>