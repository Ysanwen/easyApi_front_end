<div>
  <table class="table is-fullwidth is-bordered is-hoverable">
    <tbody>
      <tr>
        <th class="ez-th">参数key</th>
        <th class="ez-th ez-th-value">value</th>
        <th class="ez-th">类型</th>
        <th class="ez-th-description">操作</th>
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
                      选择文件…
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
          <td><button class="button is-danger" on:click={() => removeParam(index)}>删除</button></td>
        </tr>
      {/each}
      <tr>
        <td colspan="4"><button class="button is-outlined is-fullwidth" on:click={addNewParam}>新增</button></td>
      </tr>
    </tbody>
  </table>    
</div>

<script>
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