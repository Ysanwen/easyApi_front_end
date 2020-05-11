{#if (SuccessResponse && SuccessResponse.length > 0) || (ErrorResponse && ErrorResponse.length > 0)}
  <div class="tabs is-boxed">
    <ul>
      {#each SuccessResponse as response, index}
        <li class:is-active={activeItem === 'success' && activeIndex === index} on:click={() => showSuccess(index)}>
          <a href="javascript:void(0);">{$lang.successResponseDemo} {response.responseCode}</a>
        </li>
      {/each}
      {#each ErrorResponse as response, index}
        <li class:is-active={activeItem === 'error' && activeIndex === index} on:click={() => showError(index)}>
          <a href="javascript:void(0);">{$lang.errorResponseDemo} {response.responseCode}</a>
        </li>
      {/each}  
    </ul>
  </div>
  {#if responseType === 'json'}
    <!-- json type -->
    <div bind:this={responseJsonEl}></div>
  {:else}
    <pre class="ez-response-sample">
      {@html activeItem === 'success' ? SuccessResponse[activeIndex].description : ErrorResponse[activeIndex].description}
    </pre>
  {/if}
{/if}

<script>
  import { tick } from 'svelte';
  import { storeData, lang } from '../store.js';
  export let apiData;

  let SuccessResponse;
  let ErrorResponse;
  let activeItem = '';
  let activeIndex = 0;
  let responseType = '';
  let responseJsonEl;
  let jsonPreview = null;
  let refKey = '';
  let refReplace;

  $: if(apiData) {
    SuccessResponse = apiData.SuccessResponse || [];
    ErrorResponse = apiData.ErrorResponse || [];
    if (SuccessResponse && SuccessResponse.length > 0) {
      activeItem = 'success';
    } else if (ErrorResponse && ErrorResponse.length > 0) {
      activeItem = 'error';
    }
  }

  $: if (activeItem && activeIndex >= 0) {
    let responseItem = activeItem === 'success' ? SuccessResponse[activeIndex] : ErrorResponse[activeIndex];
    if (responseItem.responseType && responseItem.responseType.indexOf('json') >= 0 && responseItem.valueType.indexOf('&') >= 0) {
      responseType = 'json';
      let getRef = responseItem.valueType.match(/^\s*\&\s*\S*\s*/)[0];
      refKey = getRef.replace(/\s/g, '').replace(/\&\s*/g, '');
      refReplace = responseItem.refReplace;
      initjsonView();
    } else {
      responseType = '';
      responseJsonEl = '';
      jsonPreview = null;
    }
  }

  function showSuccess (index) {
    activeItem !== 'success' && (activeItem = 'success');
    index !== activeIndex && (activeIndex = index);
  }

  function showError (index) {
    activeItem !== 'error' && (activeItem = 'error');
    index !== activeIndex && (activeIndex = index);
  }

  async function initjsonView () {
    await tick();
    initJsonPreview();
  }

  function initJsonPreview () {
    if (jsonPreview && responseJsonEl) {
      jsonPreview.setValue(setJsonValue());
    } else {
      jsonPreview = CodeMirror(responseJsonEl, {
        mode: "application/json",
        lineNumbers: true,
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers','CodeMirror-foldgutter'],
        styleActiveLine: true,
        matchBrackets: true,
        smartIndent: true,
        readOnly: true,
        tabSize: 2,
        theme: 'blackboard',
        tabindex: 2,
        value: setJsonValue()
      });
    }
  }

  function setJsonValue () {
    let modelObj = generateModel(refKey, refReplace);
    let objStr = JSON.stringify(modelObj);
    objStr = formatJson(objStr);
    return objStr;
  }

  function generateModel (getKey, refReplaceItem) {
    let getRefKey = getKey.replace(/\[|\]|\s/g, '');
    let result = {};
    if ($storeData[getRefKey] && $storeData[getRefKey].Property) {
      let propertyList = $storeData[getRefKey].Property || [];
      for (let item of propertyList) {
        let subRef = item.valueType || '';
        if (refReplaceItem && refReplaceItem[item.key]) {
          subRef = refReplaceItem[item.key];
        }
        if (subRef.indexOf('&') >= 0) {
          subRef = subRef.replace(/^\s*\&\s*/g, '');
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
    }
    return getKey.indexOf('[') >= 0 && getKey.indexOf(']') >= 0 ? [result] : result
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
    copyText && (prettyJson += copyText);
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
  .ez-response-sample {
    background:hsl(0, 0%, 21%);
    color:hsl(0, 0%, 96%);
    margin-bottom: 1rem;
  }
</style>