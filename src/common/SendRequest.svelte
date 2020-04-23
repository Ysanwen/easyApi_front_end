<!-- header part -->
{#if headerParams && headerParams.length > 0}
  <div class="ez-request-param">
    <h6 class="title is-6">{$lang.headerParam}</h6>
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
    <h6 class="title is-6">{$lang.urlParam}</h6>
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
    <h6 class="title is-6">{$lang.queryParam}</h6>
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
{#if (method === 'post' || method === 'put' || method === 'delete') && bodyParams && bodyParams.length > 0}
 <div class="ez-request-param">
    <h6 class="title is-6">{$lang.bodyParam} contentType: {contentType}</h6>
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
{#if showSendRequest}
  <div class="ez-request">
    <button class="button is-link" on:click={sendRequest}>{$lang.sendRequestButtonText}</button>
    {#if errorMessage}
      <span class="tag is-warning is-large is-light ez-error-info">
        {errorMessage}
        <button class="delete is-small" on:click={closeErrorMessage}></button>
      </span>
    {/if}
  </div>
{/if}

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
  import { storeData, lang } from '../store.js';
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
  let showSendRequest = true;

  let response;

  $: if (apiData) {
    method = apiData.Api.method;
    headerParams = apiData.HeaderParam || [];
    urlParams = apiData.UrlParam || [];
    queryParams = apiData.QueryParam || [];
    bodyParams = apiData.BodyParam || [];
    apiData.ContentType && (contentType = apiData.ContentType);
    if ($storeData.tryRequest === false || (apiData.TryRequest && apiData.TryRequest.tryRequest === false)) {
      showSendRequest = false;
    } else {
      showSendRequest = true;
    }
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
      value: setJsonStr(),
    });
  }

  function setJsonStr () {
    if (bodyParams && bodyParams.length > 0) {
      let str = `{\n`;
      let currentIndent = 1;
      str += parseParams(bodyParams, currentIndent)
      str = str.replace(/,\n$/, '\n');
      return `${str}}`
    } else {
      return "{}"
    }
  }

  function parseParams (paramsArr, currentIndent) {
    let str = '';
    for (let item of paramsArr) {
      let indentStr = generateIndent(currentIndent);
      let key = item.key;
      let valueType = item.valueType;
      if (valueType.indexOf('&') >= 0) {
        // deal with the ref type
        let refKey = valueType.replace(/^\s*\&\s*|\[|\]|\s/g, '');
        valueType = /\[.*\]/.test(valueType) ? 'array' : 'object';
        let refReplace = item.refReplace;
        // str += valueType === 'array' ? `${indentStr}"${key}":[],\n` : `${indentStr}"${key}":{},\n`;
        let refValue = generateRefModel(refKey, valueType, currentIndent, refReplace);
        str += `${indentStr}"${key}":${refValue},\n`; 
      } else if (/\[.*\]/.test(valueType)) {
        valueType = 'array';
        str += `${indentStr}"${key}":[],\n`;
      } else {
        switch (valueType) {
          case "string":
            str += `${indentStr}"${key}":"",\n`;
            break;
          case "boolean":
            str += `${indentStr}"${key}":"",\n`;
            break;
          case "number":
            str += `${indentStr}"${key}":0,\n`;
            break;
          case "integer":
            str += `${indentStr}"${key}":0,\n`;
            break;
          case "float":
            str += `${indentStr}"${key}":0.0,\n`;
            break;
          case "array":
            str += `${indentStr}"${key}":[],\n`;
            break;
          case "object":
            str += `${indentStr}"${key}":{},\n`;
            break;
          default:
            str += `${indentStr}"${key}":"",\n`;
            break;
        }
      }
    }
    return str;
  }

  function generateRefModel (refKey, valueType, currentIndent, refReplace) {
    let str = '';
    let indentStr = generateIndent(currentIndent);
    if ($storeData[refKey] && $storeData[refKey].Property && $storeData[refKey].Property.length > 0) {
      let props = $storeData[refKey].Property;
      str += valueType === 'array' ? `[{\n` : `{\n`;
      let newProps = [];
      for (let item of props) {
        if (refReplace && refReplace[item.key]) {
          let newType =  /\[.*\]/.test(refReplace[item.key]) ? 'array' : 'object';
          let getRefKey = refReplace[item.key].replace(/^\s*\&\s*|\[|\]|\s/g, '');
          let refValue = generateRefModel(getRefKey, newType, currentIndent + 1, refReplace);
          str += `${indentStr}"${item.key}":${refValue},\n`; 
        } else {
          newProps.push(item);
        }
      }
      props = newProps;
      str += parseParams(props, currentIndent + 1);
      str = str.replace(/,\n$/, '\n');
      str += valueType === 'array' ? `${indentStr}}]` : `${indentStr}}`;
    } else {
      str += valueType === 'array' ? `[],\n` : `{},\n`;
    }
    return str;
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
          return {isFail: true, message: `${item.key} ${$lang.isRequiredText}`};
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
        errorMessage = $lang.invalidJson;
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
          errorMessage = `${$lang.bodyParamWarningText}: ${key}`;
          break;
        }
      }
      index >= 0 && (keys.splice(index, 1));
    }
    if (result && keys.length > 0) {
      errorMessage = `${$lang.bodyParamWarningText}: ${key}`;
      result = false;
    }
    return result;
  }

  function checkInputJson (jsonValue) {
    let result = true;
    for (let item of bodyParams) {
      let key = item.key;
      let valueType = transformValueType(item.valueType);
      let isRequired = item.isRequired;
      if (isRequired === false && (jsonValue[key] === undefined || jsonValue[key] === null)) {
        result = true;
      } else if (Object.prototype.toString.call(jsonValue[key]).split(/\s/)[1].toLocaleLowerCase().indexOf(valueType) >= 0) {
        result = true;
      } else {
        result = false;
        errorMessage = `${$lang.bodyParamWarningErrorTypeText}: ${key}`;
        break;
      }
    }
    return result;
  }

  function transformValueType (valueType) {
    // change to simple type
    // 'string', 'number', 'integer', 'float', 'boolean', 'array', 'object', 'null', 'date', 'datetime',
    // 'string[]', 'number[]', 'integer[]', 'float[]', 'boolean[]', 'array[]', 'object[]', 'null[]', 'date[]', 'datetime[]'
    if (valueType.indexOf('[') >= 0 && valueType.indexOf(']') >= 0) {
      return 'array';
    } else if (valueType.indexOf('&') >= 0) {
      return 'object';
    } else if (valueType.indexOf('number') >= 0 || valueType.indexOf('integer') >= 0 || valueType.indexOf('float') >= 0) {
      return 'number';
    } else if (valueType.indexOf('date') >= 0) {
      return 'string';
    } else {
      return valueType;
    }
  }

  function sendRequest () {
    response = '';
    let checkRequestHeader = checkRequestData(requestHeader, headerParams);
    if (checkRequestHeader.isFail) {
      errorMessage = `${$lang.headerParam} ${checkRequestHeader.message}`;
      return false;
    }
    let checkRequestUrl = checkRequestData(requestUrl, urlParams);
    if (checkRequestUrl.isFail) {
      errorMessage = `${$lang.urlParam} ${checkRequestUrl.message}`;
      return false;
    }
    let checkRequestQuery = checkRequestData(requestQuery, queryParams);
    if (checkRequestQuery.isFail) {
      errorMessage = `${$lang.queryParam} ${checkRequestQuery.message}`;
      return false;
    }
    if (method === 'post' || method === 'put' || method === 'delete') {
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
      if (responseInfo.status >= 200 && responseInfo.status < 300) {
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
      } else {
        // reject on HTTP error statuses
        let error = new Error(responseInfo.statusText);
        error.response = responseInfo;
        throw error;
      }
    }).then((responseData) => {
      getResponse.data = responseData;
      response = getResponse;
    }).catch((error) => {
      responseErrorMsg = error.message;
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