{#if apiName}
  <div class="ez-api-title level" id={group + '-' + apiName}>
    <div class="level-left">
      {#if deprecatedDescription}
        <h5 class="title is-5 ez-deprecated">{apiName + '(接口弃用)' + (apiNameDescription ? ' - ' + apiNameDescription : '')}</h5>
      {:else}
      <h5 class="title is-5">{apiName + (apiNameDescription ? ' - ' + apiNameDescription : '')}</h5>
      {/if}
    </div>
    <div class="level-right">
      <select id="version" class="seclect-width" bind:value={selectedVersion} on:change={doSelectVersion}>
        {#each versionList as version}
          <option value={version}>{version}</option>
        {/each}
      </select>
    </div>
  </div>
{/if}
<!-- deprecated description -->
{#if deprecatedDescription}
  <pre class="ez-description"><div class="ez-deprecated">接口弃用相关说明:{#if replaceWith}<a href={'#' + replaceWith.replace('#', '-')}>(点击去替代接口)</a>{/if}</div>{@html deprecatedDescription}</pre>
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
  export let apiData;
  export let versionList = [];
  export let selectedVersion = '';
  export let group;

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

  function doSelectVersion () {
    console.log(selectedVersion);
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