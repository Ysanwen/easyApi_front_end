{#if apiName}
  <div class="ez-api-title level" id={group + '-' + apiName}>
    <div class="level-left">
      {#if deprecatedDescription}
        <h5 class="title is-5 ez-deprecated">{apiName + '(' + $lang.deprecated + ')' + (apiNameDescription ? ' - ' + apiNameDescription : '')}</h5>
      {:else}
      <h5 class="title is-5">{apiName + (apiNameDescription ? ' - ' + apiNameDescription : '')}</h5>
      {/if}
    </div>
    <div class="level-right">
      <select class="seclect-width" bind:value={selectedVersion} on:change={doSelectVersion}>
        {#each $versionList as version, index}
          <option value={version} disabled={disableVersionList.indexOf(version) >= 0}>{version}</option>
        {/each}
      </select>
    </div>
  </div>
{/if}
<!-- deprecated description -->
{#if deprecatedDescription}
  <pre class="ez-description">
    <div class="ez-deprecated">
      {@html replaceWith ? getReplaceLink() : deprecatedDescription}
    </div>
  </pre>
{/if}

<!-- api description -->
{#if description}
  <pre class="ez-description">
    {@html description}
  </pre>
{/if}

<!-- api method and path -->
<div class="tags has-addons">
  {#if method === 'get'}
    <span class="tag is-primary is-medium">{method}</span>
  {:else if method === 'post'}
    <span class="tag is-info is-medium">{method}</span>
  {:else if method === 'put'}
    <span class="tag is-warning is-medium">{method}</span>
  {:else}
    <span class="tag is-danger is-medium">{method}</span>
  {/if}
  <span class="tag is-medium ez-api-path">{path}</span>
</div>


<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { versionList, globalSelectedVersion, storeData, lang } from '../store.js';
  
  export let apiData;
  export let group;

  const dispatch = createEventDispatcher();
  let selectedVersion = '';
  let disableVersionList = [];

  let apiName;
  let apiNameDescription;
  let description;
  let deprecatedDescription;
  let replaceWith;
  let method;
  let path;

  $: if (apiData) {
    apiName = apiData.Name ? apiData.Name.key : '';
    apiNameDescription = apiData.Name ? apiData.Name.description : '';
    description = apiData.Description ? apiData.Description.description : '';
    deprecatedDescription = apiData.Deprecated ? apiData.Deprecated.description : '';
    replaceWith = apiData.Deprecated ? apiData.Deprecated.replaceWith : '';
    method = apiData.Api ? apiData.Api.method : '';
    path = apiData.Api ? apiData.Api.path : '';
  }

  onMount (() => {
    selectedVersion = $globalSelectedVersion;
    let disable = [];
    for (let v of $versionList) {
      if (!$storeData[v] || !$storeData[v][group] || !$storeData[v][group][apiName]) {
        disable.push(v);
      }
    }
    disableVersionList = disable;
  })

  function getReplaceLink () {
    if (deprecatedDescription && replaceWith) {
      let findSplit = replaceWith.indexOf('#');
      let group = '';
      let replaceName = '';
      if (findSplit >= 0) {
        group = replaceWith.substr(0, findSplit);
        replaceName = replaceWith.substr(findSplit + 1);
      } else {
        group = apiData.Group ? (apiData.Group.key || '') : '';
        replaceName = replaceWith;
      }
      let replaceLink = `<a href='#${group}-${replaceName}'}>${replaceName}</a>`;
      return deprecatedDescription.replace(replaceWith, replaceLink);
    } else {
      return ''
    }
  }
  function doSelectVersion () {
    if ($storeData[selectedVersion] && $storeData[selectedVersion][group] && $storeData[selectedVersion][group][apiName]) {
      dispatch('changeApiVersion', $storeData[selectedVersion][group][apiName]);
    }
  }
</script>

<style>
  .ez-api-title {
    margin-top: 1rem;
    margin-bottom: 0.6rem;
  }
  .level-left {
    max-width: 85%;
  }
  .ez-deprecated {
    color: hsl(348, 100%, 61%);
  }
  .seclect-width {
    min-width: 120px;
  }
  .ez-description {
    margin-bottom: 1rem;
  }
  .ez-api-path {
    flex: auto;
    justify-content: left;
  }
</style>