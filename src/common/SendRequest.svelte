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
    <h6 class="title is-6">body参数 contentType: {contentType}</h6>
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
{#if response}
  <ShowResponseResult response={response}/>
{/if}
<!-- response error -->
{#if responseErrorMsg}
  <pre class="ez-response-error">{responseErrorMsg}</pre>
{/if}

<script>
  import { onMount, onDestroy } from 'svelte';
  import { storeData } from '../store.js';
  import FormDataTable from './FormDataTable.svelte';
  import FormUrlEncoded from './FormUrlEncoded.svelte';
  import ShowResponseResult from './ShowResponseResult.svelte';
  import {fetch} from 'whatwg-fetch';

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
  let responseErrorMsg = '';

  let response;

  $: if (apiData) {
    method = apiData.Api.method;
    headerParams = apiData.HeaderParam || [];
    urlParams = apiData.UrlParam || [];
    queryParams = apiData.QueryParam || [];
    bodyParams = apiData.BodyParam || [];
    apiData.ContentType && (contentType = apiData.ContentType);
    // modify contentType
    contentType = 'application/json';
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
        errorMessage = '存在非法json格式';
        return false;
      } else {
        let value = editor.getValue();
        let jsonValue = JSON.parse(value);
        if (checkInputJson(jsonValue)) {
          requestBody = jsonValue;
          return true;
        } else {
          return false;
        }
      }
    } else if (contentType === 'multipart/form-data' || contentType === 'application/x-www-form-urlencoded') {
      return checkFormData()
    } else if (contentType === 'text/plain') {
      return true;
    }
  }

  function trimFormData() {
    return formDataArray.map((item) => {
      if (item.valueType === 'text') {
        item.key = item.key.replace(/^\s+|\s+$/g,'');
        item.value = item.value.replace(/^\s+|\s+$/g,'');
      }
      return item;
    })
  }

  function checkFormData () {
    let params = {};
    let keys = [];
    let result = true;
    for (let item of bodyParams) {
      params[item.key] = item;
      item.isRequired !== false && keys.push(item.key);
    }
    let formData = trimFormData();
    for (let dataItem of formData) {
      let key = dataItem.key;
      let index = keys.indexOf(key);
      if (params[key]) {
        if (params[key].isRequired && dataItem.value === '') {
          result = false;
          errorMessage = `body params key: "${key}" is required`
          break;
        }
      }
      index >= 0 && (keys.splice(index, 1));
    }
    if (result && keys.length > 0) {
      errorMessage = `body params key: "${keys[0]}" is required`;
      result = false;
    }
    return result;
  }

  function checkInputJson (jsonValue) {
    let result = true;
    for (let item of bodyParams) {
      let key = item.key;
      let valueType = item.valueType;
      let isRequired = item.isRequired;
      if (isRequired === false && (jsonValue[key] === undefined || jsonValue[key] === null)) {
        result = true;
      } else if (Object.prototype.toString.call(jsonValue[key]).toLocaleLowerCase().indexOf(valueType) < 0) {
        result = false;
        errorMessage = `body params key: "${key}" with error type`;
        break;
      }
    }
    return result;
  }

  function sendRequest () {
    response = '';
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
    if (method === 'post' || method === 'put') {
      let checkBody = checkRequestBody();
      if (checkBody) {
        let bodyData = generateFetchBodyData();
        sendFetchRequest(bodyData);
      } else {
        return false;
      }
    } else {
      sendFetchRequest();
    }
    errorMessage = '';
    responseErrorMsg = '';
  }

  function generateFetchBodyData () {
    if (contentType === 'application/json') {
      return JSON.stringify(requestBody);
    } else if (contentType === 'multipart/form-data') {
      let bodyData = new FormData();
      let formData = trimFormData();
      for (let item of formData) {
        bodyData.append(item.key, item.value);
      }
      return bodyData
    } else if (contentType === 'application/x-www-form-urlencoded') {
      let bodyDataArray = [];
      let formData = trimFormData();
      for (let item of formData) {
        let encodedStr = encodeURIComponent(item.key) + '=' + encodeURIComponent(item.value);
        bodyDataArray.push(encodedStr);
      }
      return bodyDataArray.join('&');
    } else if (contentType === 'text/plain') {
      return requestTextBody;
    } else {
      return null;
    }
  }

  function sendFetchRequest (bodyData) {
    // credentials setting
    // "omit" - don't include authentication credentials (e.g. cookies) in the request
    // "same-origin" - include credentials in requests to the same site
    // "include" - include credentials in requests to all sites
    let request = {credentials: 'same-origin'}; // 
    let url = apiData.Api.path;
    let method = apiData.Api.method.toLocaleUpperCase();
    request.method = method;
     // set urlParams
    for (let key in requestUrl) {
      url = url.replace(`{${key}}`, requestUrl[key])
    }
    if (url.indexOf('http') < 0 && url.indexOf('//') < 0 && $storeData.baseUrl) {
      url = $storeData.baseUrl.replace(/\/?$/g, '') + '/' + url.replace(/^\/?/g,'');
    }
    // set header
    for (let key in requestHeader) {
      request.headers = request.headers || {};
      request.headers[key] = requestHeader[key];
    }
    // set query params
    let queryArr = [];
    for (let key in requestQuery) {
      let encodedStr = encodeURIComponent(key) + '=' + encodeURIComponent(requestQuery[key]);
      queryArr.push(encodedStr);
    }
    if (queryArr.length > 0) {
      url += '?' + queryArr.join('&');
    }
    // if has a request body
    if (bodyData) {
      request.headers = request.headers || {};
      request.headers['content-type'] = contentType;
      request.body = bodyData;
    }
    let getResponse = {};
    fetch(url, request).then((responseInfo) => {
      let contentType = responseInfo.headers.get('Content-Type') || 'application/json';
      let contentDisposition = responseInfo.headers.get('Content-Disposition') || '';
      let headers = {};
      responseInfo.headers.forEach((value, key) => {
        headers[key] = value;
      })
      getResponse.headers = headers;
      getResponse.status = responseInfo.status;
      if (contentDisposition.indexOf('attachment') >= 0) {
        return responseInfo.blob()
      } else {
        if (contentType.indexOf('application/json') >= 0) {
          return responseInfo.json();
        } else if (contentType.indexOf('text/') >= 0) {
          return responseInfo.text();
        } else {
          throw new Error('unknow response content type');
        }
      }
    }).then((responseData) => {
      getResponse.data = responseData;
      response = getResponse;
    }).catch((error) => {
      responseErrorMsg = error.message
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
  .ez-response-error {
    margin-top: 8px;
    color: #cc0f35;
  }
</style>