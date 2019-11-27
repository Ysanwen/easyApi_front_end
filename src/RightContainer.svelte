<div class="ez-right-container column">
  <div class="main-content">
    <!-- <button class="button" on:click={addGroup}>add a group</button> -->
    {#each groupList as group, id}
      <GroupTitle groupName={group}/>
      {#each Object.keys(versionData[group]) as apiData, aId}
        <ApiTitle apiData={versionData[group][apiData]} group={group} versionList={storeData.versionList} selectedVersion={selectedVersion}/>
        <Params apiData={versionData[group][apiData]}/>
      {/each}
    {/each}
  </div>
</div>
<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import GroupTitle from './common/GroupTitle.svelte';
  import ApiTitle from './common/ApiTitle.svelte';
  import Params from './common/Params.svelte';

  export let selectedVersion = '';
  export let storeData = {};

  let versionData;
  let groupList = [];

  const dispatch = createEventDispatcher();
  
  function addGroup () {
    dispatch('addGroup', {});
  }
  $: {
    versionData = selectedVersion ? storeData[selectedVersion] : {};
    groupList = Object.keys(versionData);
    console.log(versionData);
  }

</script>


<style>
  .ez-right-container {
    height: 100%;
    box-sizing: border-box;
    overflow-y: scroll;
  }
  .main-content {
    padding: 6px 8px;
  }
</style>