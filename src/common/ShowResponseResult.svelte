<div class="tabs is-boxed ez-tabs">
  <ul>
    <li class:is-active={activeItem === 'status'} on:click={() => changeActiveItem('status')}>
      <a href="javascript:void(0);">Response Status {response.status}</a>
    </li>
    <li class:is-active={activeItem === 'header'} on:click={() => changeActiveItem('header')}>
      <a href="javascript:void(0);">Response Headers</a>
    </li>
  </ul>
</div>

{#if activeItem === 'status'}
  <div class="ez-request-body">
    {#if hasAttachment}
      <pre><a href={attachmentFileUrl} download={attachmentFileName}>{attachmentFileName}</a></pre>
    {:else if responseType.indexOf('application/json') >= 0}
      <!-- json type -->
      <div bind:this={responseJsonEl}></div>
    {:else if responseType.indexOf('text/') >= 0}
      <!-- text type -->
      <pre class="ez-header-content">{responseContent}</pre>
    {/if}
  </div>
{:else}
  <div class="ez-request-body">
    <pre class="ez-header-content">{headerContent}</pre>
  </div>
{/if}  


<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { lang } from '../store.js';
  
  export let response;

  let responseType = '';

  let hasAttachment = false;
  let attachmentFileName;
  let attachmentFileUrl;

  let responseContent;
  let headerContent = '';
  let activeItem = 'status';

  let responseJsonEl;
  let jsonPreview;
   
  let hasMounted = false;

  $: if (response && hasMounted) {
    activeItem === 'status' && initBodyView();
    activeItem === 'header' && initHeaderView();
  }

  function changeActiveItem (activityTag) {
    if (activeItem !== activityTag) {
      activeItem = activityTag;
      if (activeItem === 'header') {
        responseJsonEl = null;
        jsonPreview = null;
        // initHeaderView();
      } else if (activeItem === 'status') {
        // initBodyView();
      }
    }
  }

  async function initBodyView () {
    responseType = response.headers && response.headers['content-type'] ? response.headers['content-type'] : 'application/json';
    responseContent = response.data;
    let contentDisposition = response.headers && response.headers['content-disposition'] ? response.headers['content-disposition'] : '';
    if (contentDisposition.indexOf('attachment') >= 0) {
      hasAttachment = true;
      if (contentDisposition.indexOf('filename') >= 0) {
        attachmentFileName = contentDisposition.replace(/(.*filename=)|"/g, '');
      } else {
        attachmentFileName = $lang.attachment;
      }
      attachmentFileUrl = window.URL.createObjectURL(new Blob([responseContent]));
    } else {
      hasAttachment = false;
      attachmentFileName = '';
      attachmentFileUrl = '';
    }
    if (responseType.indexOf('application/json') >= 0 ) {
      await tick();
      initJsonPreview();
    }
  }

  function initHeaderView () {
    let headerStr = '';
    for (let key in response.headers) {
      headerStr += `${key}: ${response.headers[key]}\n`;
    }
    headerContent = headerStr;
  }

  onMount (() => {
    hasMounted = true;
  })

  function initJsonPreview () {
    if (jsonPreview && responseJsonEl) {
      jsonPreview.setValue(setJsonValue());
    } else {
      jsonPreview = CodeMirror(responseJsonEl, {
        mode: "application/json",
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        smartIndent: true,
        readOnly: true,
        tabSize: 2,
        theme: 'blackboard',
        tabindex: 2,
        value: setJsonValue(),
      });
    }
  }

  function setJsonValue () {
    let objStr = JSON.stringify(responseContent);
    objStr = formatJson(objStr);
    return objStr;
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
  .ez-tabs {
    margin-top: 8px;
    margin-bottom: 0.5rem;
  }
  .ez-header-content {
    background: hsl(0, 0%, 21%);
    color: hsl(0, 0%, 96%);
  }
</style>

