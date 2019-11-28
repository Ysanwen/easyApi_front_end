<div class="ez-right-container column" id="ez-main-container">
  <div class="main-content" id="ez-main-content">
    {#each groupList as group (group)}
      <GroupTitle groupName={group}/>
      {#each Object.keys(versionData[group]) as apiDataKey ($globalSelectedVersion + '-' + apiDataKey)}
        <ApiBlock apiData={versionData[group][apiDataKey]} belongGroup={group}/>
      {/each}
    {/each}
  </div>
</div>
<script>
  import { onMount, onDestroy } from 'svelte';
  import { globalSelectedVersion, storeData, activityGroup, activityItem } from './store.js';
  import GroupTitle from './common/GroupTitle.svelte';
  import ApiBlock from './ApiBlock.svelte';

  let versionData;
  let groupList = [];
  let content;
  let isComputedPosition = false;

  $: {
    versionData = $globalSelectedVersion ? $storeData[$globalSelectedVersion] : {};
    groupList = Object.keys(versionData);
  }

  onMount(() => {
    if (window.requestAnimationFrame) {
      content = document.getElementById('ez-main-container');
      content.addEventListener('scroll', scrollHandler);
    }
  })

  function scrollHandler () {
    if (!isComputedPosition) {
      let innerHeight = Math.floor(window.innerHeight / 2);
      window.requestAnimationFrame(() => {
        let domArray = document.getElementsByClassName('ez-api-title');
        if (domArray.length > 0) {
          for (let el of domArray) {
            let offset = el.getBoundingClientRect().top;
            if (offset > 56 && offset <= innerHeight) {
              let id = el.id;
              let index = id.indexOf('-');
              if (index > 0) {
                activityGroup.set(id.substr(0,index));
                activityItem.set(id.substr(index + 1));
              }
              break;
            }
          }
        }
        isComputedPosition = false;
      })
    }
    isComputedPosition = true;
  }

  onDestroy (() => {
    if (window.requestAnimationFrame) {
      content && content.removeEventListener('scroll', scrollHandler);
      content = null;
    }
  })

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