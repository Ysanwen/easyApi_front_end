<!-- header part -->
{#if headerParams && headerParams.length > 0}
  <div class="ez-request-param">
    <h6 class="title is-6">Headers请求参数</h6>
    {#each headerParams as header (header.key)}
      <div class="field has-addons">
        <p class="control">
          <span class="button ez-key">{#if header.isRequired !== false}<span class="ez-is-required">*</span>{/if}{header.key}</span>
        </p>
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
        <p class="control">
          <span class="button ez-key">{#if url.isRequired !== false}<span class="ez-is-required">*</span>{/if}{url.key}</span>
        </p>
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
        <p class="control">
          <span class="button ez-key">{#if query.isRequired !== false}<span class="ez-is-required">*</span>{/if}{query.key}</span>
        </p>
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
      <div class="ez-request-body">
        <div bind:this={jsonEditorEl}></div>
      </div>
    {/if}
    <!-- form-data type -->
    {#if contentType === 'multipart/form-data'}
      <FormDataTable bind:paramsArray={formDataArray} />
    {/if}
    <!-- urlencoded type -->
    {#if contentType === 'application/x-www-form-urlencoded'}
      <FormUrlEncoded bind:paramsArray={formDataArray} />
    {/if}
    <!-- text type -->
    {#if contentType === 'text/plain'}
      <textarea class="textarea" rows="3" bind:value={requestTextBody}></textarea>
    {/if}
  </div> 
{/if}
<!-- send request -->
<div class="ez-request">
  <button class="button is-link" on:click={sendRequest}>Try Send Request</button>
  {#if errorMessage}
    <span class="tag is-warning is-large is-light ez-error-info">
      {errorMessage}
      <button class="delete is-small" on:click={closeErrorMessage}></button>
    </span>
  {/if}
</div>

<!-- response result -->
{#if responseData && responseType}
  <ShowResponseResult responseType={responseType} responseContent={responseData}/>
{/if}

<script>
  import { onMount, onDestroy } from 'svelte';
  import { storeData } from '../store.js';
  import FormDataTable from './FormDataTable.svelte';
  import FormUrlEncoded from './FormUrlEncoded.svelte';
  import ShowResponseResult from './ShowResponseResult.svelte';
  import axios from 'axios';

  export let apiData;

  let method;
  let headerParams;
  let urlParams;
  let queryParams;
  let bodyParams;
  let contentType = 'application/json'; // ContentType
  let editor;
  let jsonEditorEl;

  let requestHeader = {};
  let requestUrl = {};
  let requestQuery = {};
  let requestBody = {};
  let requestTextBody = '';
  let formDataArray = [{key: '', value: '', valueType: 'text'}];

  let errorMessage = '';

  let responseData;
  let responseType;

  $: if (apiData) {
    method = apiData.Api.method;
    headerParams = apiData.HeaderParam || [];
    urlParams = apiData.UrlParam || [];
    queryParams = apiData.QueryParam || [];
    bodyParams = apiData.BodyParam || [];
    apiData.ContentType && (contentType = apiData.ContentType);
    // contentType = 'text/plain'
  }

  onMount (() => {
    if ((method === 'post' || method === 'put') && contentType === 'application/json') {
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
      // obj.userRole=[{a:1},'b','c'];
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

  function closeErrorMessage () {
    errorMessage = '';
  }

  function checkRequestData (data, dataConfigArray) {
    for (let item of dataConfigArray) {
      if (item.isRequired !== false) {
        if (data[item.key] === null || data[item.key] === undefined || data[item.key] === '') {
          return {isFail: true, message: `key: ${item.key} is required`};
          break;
        }
      }
    }
    return {isFail: false, message: ''}
  }

  function checkRequestBody () {
    if (contentType === 'application/json') {
      let hasError = false;
      editor.eachLine((line) => {
        if (line.gutterMarkers) {
          hasError = true;
        }
      });
      if (hasError) {
        console.log('has error value');
      } else {
        let value = editor.getValue();
        console.log(JSON.parse(value));
      }
    } else if (contentType === 'multipart/form-data' || contentType === 'application/x-www-form-urlencoded') {
      console.log('form-data type')
    } else if (contentType === 'text/plain') {
      console.log('text/plain')
    }
  }

  function sendRequest () {
    let checkRequestHeader = checkRequestData(requestHeader, headerParams);
    if (checkRequestHeader.isFail) {
      errorMessage = 'request header ' + checkRequestHeader.message;
      return false;
    }
    let checkRequestUrl = checkRequestData(requestUrl, urlParams);
    if (checkRequestUrl.isFail) {
      errorMessage = 'request url ' + checkRequestUrl.message;
      return false;
    }
    let checkRequestQuery = checkRequestData(requestQuery, queryParams);
    if (checkRequestQuery.isFail) {
      errorMessage = 'request query ' + checkRequestQuery.message;
      return false;
    }
    // console.log(requestHeader, requestUrl, requestQuery)
    // console.log(requestTextBody)
    if (method === 'post' || method === 'put') {
      checkRequestBody();
    }
    sendAxiosRequest();
  }

  function sendAxiosRequest() {
    let request = {};
    let url = apiData.Api.path;
    let method = apiData.Api.method;
    // set header
    for (let key in requestHeader) {
      request.headers = request.headers || {};
      request.headers[key] = requestHeader[key];
    }
    // set urlParams
    for (let key in requestUrl) {
      url = url.replace(`{${key}}`, requestUrl[key])
    }
    request.url = url;
    if (url.indexOf('http') < 0 && url.indexOf('//') < 0) {
      request.baseURL = $storeData.baseUrl;
    }
    // set query params
    for (let key in requestQuery) {
      request.params = request.params || {};
      request.params[key] = requestQuery[key];
    }
    // console.log(request)
    axios(request).then((response) => {
      responseData =  response.data;
      responseType = response.headers && response.headers['content-type'] ? response.headers['content-type'] : 'application/json';
    })

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
  .ez-is-required {
    color:hsl(348, 100%, 61%);
    margin-right: 6px;
  }
  .ez-type {
    min-width: 120px;
  }
  .ez-request-body {
    border: 1px solid #ccc;
  }
  .ez-error-info {
    margin-left: 8px;
  }
</style>