{#if showRef}
  <td>{refKey}
    <div class="modal-info">
      <span class="tag is-primary" on:mouseenter={showParamInfo} on:click={showParamInfo}>?</span>
      <div class={isActive ? "show-card modal-card" : "hide-card modal-card"}>
        <div class="close-top">
          <span class="modal-title">{modelInfo.Model.description || 'self define type'}</span>
          <span class="tag is-delete" on:click={closeModal}></span>
        </div>
        <div class="info-area" bind:this={responseJsonEl}></div>
      </div>
    </div>
  </td>
{:else}
  <td>{refKey}</td>
{/if}  

<script>
  import { tick } from 'svelte';
  import { storeData, lang } from '../store.js';

  export let valueType;

  let isActive = false;
  let showRef = false;
  let refKey = '';
  let modelInfo = {};
  let responseJsonEl;
  let jsonPreview = null;

  $: if (valueType) {
    if (valueType.indexOf('$Ref:') >= 0) {
      refKey = valueType.replace(/^\s*\$\s*Ref\s*:\s*/g, '');
      modelInfo = $storeData[refKey];
      showRef = true;
    } else {
      refKey = valueType
    }
  }

  function showParamInfo () {
    isActive = true;
    if (!jsonPreview) {
      initjsonView();
    }
  }

  function closeModal () {
    isActive = false;
  }

  async function initjsonView () {
    await tick();
    initJsonPreview();
  }

  function initJsonPreview () {
    jsonPreview = CodeMirror(responseJsonEl, {
      mode: "application/json",
      // gutters: ["CodeMirror-lint-markers"],
      // lint: true,
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers','CodeMirror-foldgutter'],
      styleActiveLine: true,
      matchBrackets: true,
      smartIndent: true,
      readOnly: true,
      tabSize: 2,
      theme: 'eclipse',
      // theme: 'blackboard',
      tabindex: 2,
      value: setJsonValue()
    });
  }

  function setJsonValue () {
    let modelObj = generateModel(refKey);
    let objStr = JSON.stringify(modelObj);
    objStr = formatJson(objStr);
    return objStr;
  }

  function generateModel (refKey) {
    if ($storeData[refKey] && $storeData[refKey].Property) {
      let propertyList = $storeData[refKey].Property || [];
      let result = {};
      for (let item of propertyList) {
        if (item.valueType.indexOf('$Ref') >= 0) {
          let subRef = item.valueType.replace(/^\s*\$\s*Ref\s*:\s*/g, '');
          if (subRef.indexOf('[') >= 0 && subRef.indexOf(']') >= 0) {
            subRef = subRef.replace(/\[|\]|\s/g, '');
            result[item.key] = [generateModel(subRef)]
          } else {
            result[item.key] = generateModel(subRef)
          }
        } else {
          // result[item.key] = `${item.valueType} isRequired:${item.isRequired ? 'true' : 'false'} ${item.description}`
          result[item.key] = `${item.valueType} ${item.description}`
        }
      }
      return result
    } else {
      return {}
    }
  }

  function formatJson (jsonStr) {
    let prettyJson = '';
    let currentIndent = 0;
    let long = jsonStr.length;
    let copyText = '';
    for (let i = 0; i < long; i++) {
      if (jsonStr[i] === '{') {
        currentIndent += 1;
        prettyJson += copyText + jsonStr[i] + '\n' + generateIndent(currentIndent);
        copyText = '';
      } else if (jsonStr[i] === '}') {
        currentIndent -= 1;
        prettyJson += copyText + '\n' + generateIndent(currentIndent) + jsonStr[i];
        copyText = '';
      } else {
        copyText += jsonStr[i];
        if (jsonStr[i] === ',') {
          prettyJson += copyText + '\n' + generateIndent(currentIndent);
          copyText = '';
        }
      } 
    }
    return prettyJson;
  }

  function generateIndent (indentNumber) {
    let str = '';
    for (let i = 0; i < indentNumber; i++) {
      str = str + '  ';
    }
    return str;
  }
</script>

<style>
  .modal-info {
    position: relative;
    display: inline-block;
  }
  .tag {
    cursor: pointer;
  }
  .modal-card {
    position: absolute;
    padding: 6px 8px;
    top: 0px;
    left: 0px;
    z-index: 10;
    box-shadow: 0 0.5em 1em -0.125em rgba(216, 162, 162, 0.2), 0 0 0 1px rgba(10,10,10,.02);
    color: #4a4a4a;
    /* min-width:400px;
    min-height: 300px; */
    overflow: scroll;
    background-color: #fff;
  }
  .show-card {
    display: block;
  }
  .hide-card {
    display: none;
  }
  .close-top {
    text-align: right;
  }
  .modal-title {
    float: left;
    font-weight: 450;
  }
</style>