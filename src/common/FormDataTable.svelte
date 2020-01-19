<div>
  <table class="table is-fullwidth is-bordered is-hoverable">
    <tbody>
      <tr>
        <th class="ez-th">{$lang.param}</th>
        <th class="ez-th ez-th-value">{$lang.value}</th>
        <th class="ez-th">{$lang.type}</th>
        <th class="ez-th-description">{$lang.operate}</th>
      </tr>
      {#each paramsArray as param, index}
        <tr>
          <td><input class="input" type="text" bind:value={param.key}></td>
          <td>
            {#if param.valueType === "file"}
              <div class="file has-name">
                <label class="file-label">
                  <input class="file-input" type="file" on:change={(e) =>selectFile(e,index)}>
                  <span class="file-cta">
                    <span class="file-icon">
                      <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label">
                      ${lang.selectFile}
                    </span>
                  </span>
                  <span class="file-name">
                    {param.value ? param.value.name : '---'}
                  </span>
                </label>
              </div>
            {:else}  
              <input class="input" type="text" bind:value={param.value}>
            {/if}  
          </td>
          <td>
            <div class="select">
              <select bind:value={param.valueType} on:change={() =>doChangeType(index)}>
                <option value="text">text</option>
                <option value="file">file</option>
              </select>
            </div>
          </td>
          <td><button class="button is-danger" on:click={() => removeParam(index)}>{$lang.delete}</button></td>
        </tr>
      {/each}
      <tr>
        <td colspan="4"><button class="button is-outlined is-fullwidth" on:click={addNewParam}>{$lang.addNew}</button></td>
      </tr>
    </tbody>
  </table>    
</div>

<script>
  import { lang } from '../store.js';
  export let paramsArray = [];

  function selectFile (e, index) {
    let files = e.target.files;
    if (files.length >= 1) {
      let file = files[0];
      paramsArray[index].value = file;
      paramsArray = paramsArray;
    }
  }

  function doChangeType (index) {
    paramsArray[index].value = '';
    paramsArray = paramsArray;
  }

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