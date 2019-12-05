<!-- json type -->
{#if responseType.indexOf('application/json') >= 0}
  <div class="ez-request-body">
    <div bind:this={responseJsonEl}></div>
  </div>
{/if}

<script>
  import { onMount, onDestroy } from 'svelte';
  
  export let responseType = '';
  export let responseContent;

  let responseJsonEl;
  let jsonPreview;

  $: if (responseContent) {
    jsonPreview && jsonPreview.setValue(setJsonValue ());
  }

  onMount (() => {
    if (responseType.indexOf('application/json') >= 0 ) {
      initJsonPreview();
    }
  })

  onDestroy (() => {
    if (responseJsonEl && responseJsonEl.parentNode) {
      responseJsonEl.parentNode.remove(responseJsonEl);
      responseJsonEl = null;
      jsonPreview = null;
    }
  })

  function initJsonPreview () {
    jsonPreview = CodeMirror(responseJsonEl, {
      mode: "application/json",
      gutters: ["CodeMirror-lint-markers"],
      lint: true,
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      smartIndent: true,
      // readOnly: true,
      tabSize: 2,
      theme: 'blackboard',
      tabindex: 2,
      value: setJsonValue(),
    });
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
  .ez-request-body {
    margin-top: 6px;
  }
</style>

