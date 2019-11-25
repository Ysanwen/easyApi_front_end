<div class="ez-right-container column">
  <div class="main-content">
    <button class="button" on:click={addGroup}>add a group</button>
  </div>
</div>
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  
  function addGroup () {
    dispatch('addGroup', {});
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