<!-- header part -->
{#if headerParams && headerParams.length > 0}
  <div class="ez-request-param">
    <h6 class="title is-6">Headers请求参数</h6>
    {#each headerParams as header (header.key)}
      <div class="field has-addons">
        <p class="control"><span class="button ez-key">{header.key}</span></p>
        <p class="control is-expanded">
          <input class="input" type="text" bind:value={requestHeader[header.key]}>
        </p>
        <p class="control"><span class="button is-static ez-type">{header.valueType}</span></p>
      </div>
    {/each} 
  </div> 
{/if}
<!-- url part -->
{#if urlParams && urlParams.length > 0}
  <div class="ez-request-param">
    <h6 class="title is-6">url请求参数</h6>
    {#each urlParams as url (url.key)}
      <div class="field has-addons">
        <p class="control"><span class="button ez-key">{url.key}</span></p>
        <p class="control is-expanded">
          <input class="input" type="text" bind:value={requestUrl[url.key]}>
        </p>
        <p class="control"><span class="button is-static ez-type">{url.valueType}</span></p>
      </div>
    {/each} 
  </div> 
{/if}
<!-- query part -->
{#if queryParams && queryParams.length > 0}
  <div class="ez-request-param">
    <h6 class="title is-6">query查询请求参数</h6>
    {#each queryParams as query (query.key)}
      <div class="field has-addons">
        <p class="control"><span class="button ez-key">{query.key}</span></p>
        <p class="control is-expanded">
          <input class="input" type="text" bind:value={requestQuery[query.key]}>
        </p>
        <p class="control"><span class="button is-static ez-type">{query.valueType}</span></p>
      </div>
    {/each} 
  </div> 
{/if}
<!-- body part -->
{#if (method === 'post' || method === 'put') && bodyParams && bodyParams.length > 0}
 <div class="ez-request-param">
    <h6 class="title is-6">body参数</h6>
    <!-- json type -->
    {#if contentType === 'application/json'}
      <div class="ez-json-editor">
        <div bind:this={jsonEditorEl}></div>
      </div>
    {/if}
  </div> 
{/if}
<!-- send request -->
<div class="ez-request">
  <button class="button is-link" on:click={sendRequest}>Try Send Request</button>
</div>

<script>
  import { onMount, tick, onDestroy } from 'svelte';
  export let apiData;

  let method;
  let headerParams;
  let urlParams;
  let queryParams;
  let bodyParams;
  let contentType = 'application/json'; // ContentType
  let requestHeader = {};
  let requestUrl = {};
  let requestQuery = {};
  let requestBody = {};
  let editor;
  let jsonEditorEl;

  $: if (apiData) {
    method = apiData.Api.method;
    headerParams = apiData.HeaderParam || [];
    urlParams = apiData.UrlParam || [];
    queryParams = apiData.QueryParam || [];
    bodyParams = apiData.BodyParam || [];
    apiData.ContentType && (contentType = apiData.ContentType);
  }

  onMount (() => {
    if (method === 'post' && contentType === 'application/json') {
      initJsonEditor();
    }
  })
  
  onDestroy (() => {
    if (jsonEditorEl && jsonEditorEl.parentNode) {
      jsonEditorEl.parentNode.remove(jsonEditorEl);
      jsonEditorEl = null;
      editor = null;
    }
  })

  function initJsonEditor () {
    editor = CodeMirror(jsonEditorEl, {
      mode: "application/json",
      gutters: ["CodeMirror-lint-markers"],
      lint: true,
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      smartIndent: true,
      tabSize: 2,
      theme: 'eclipse',
      tabindex: 2,
      value: setJsonValue(),
    });
  }

  function setJsonValue () {
    let obj = {};
    if (bodyParams && bodyParams.length > 0) {
      for (let item of bodyParams) {
        let key = item.key;
        let valueType = item.valueType;
        switch (valueType) {
          case "string":
            obj[key] = "";
            break;
          case "boolean":
            obj[key] = "";
            break;
          case "number":
             obj[key] = 0;
            break;
          case "array":
             obj[key] = [];
            break;
          case "object":
             obj[key] = {};
            break;
          default:
            obj[key] = "";
            break;
        }
      }
      obj.userRole=[{a:1},'b','c'];
      let objStr = JSON.stringify(obj);
      objStr = formatJson(objStr);
      return objStr
    } else {
      return JSON.stringify(obj)
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

  function sendRequest () {
    console.log(requestHeader, requestUrl, requestQuery)
    // let hasError = false;
    // editor.eachLine((line) => {
    //   if (line.gutterMarkers) {
    //     hasError = true;
    //   }
    // });
    // if (hasError) {
    //   console.log('has error value');
    // } else {
    //   let value = editor.getValue();
    //   console.log(JSON.parse(value));
    // }
  }
</script>

<style>
  .ez-request-param {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .ez-key {
    min-width: 160px;
  }
  .ez-type {
    min-width: 120px;
  }
  .ez-json-editor {
    border: 1px solid #ccc;
  }
</style>