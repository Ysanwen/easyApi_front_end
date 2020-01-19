<div>
  <table class="table is-fullwidth is-bordered is-hoverable">
    <tbody>
      <tr>
        <th class="ez-th">{$lang.param}</th>
        <th class="ez-th ez-th-value">{$lang.value}</th>
        <th class="ez-th-description">{$lang.operate}</th>
      </tr>
      {#each paramsArray as param, index}
        <tr>
          <td><input class="input" type="text" bind:value={param.key}></td>
          <td><input class="input" type="text" bind:value={param.value}></td>
          <td><button class="button is-danger" on:click={() => removeParam(index)}>{$lang.delete}</button></td>
        </tr>
      {/each}
      <tr>
        <td colspan="3"><button class="button is-outlined is-fullwidth" on:click={addNewParam}>{$lang.addNew}</button></td>
      </tr>
    </tbody>
  </table>    
</div>

<script>
  import { lang } from '../store.js';
  export let paramsArray = [];

  function removeParam (index) {
    paramsArray.splice(index, 1);
    paramsArray = paramsArray;
  }

  function addNewParam () {
    let len = paramsArray.length;
    paramsArray.push({key: '', value: '', valueType: 'text'});
    paramsArray = paramsArray;
  }


</script>

<style>
  .ez-th-value {
    width: 60%;
  }
</style>