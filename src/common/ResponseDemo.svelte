{#if SuccessResponse || ErrorResponse}
  <div class="tabs is-boxed">
    <ul>
      {#if SuccessResponse}
        <li class:is-active={activeItem === 'success'} on:click={showSuccess}>
          <a href="javascript:void(0);">SuccessResponse Sample</a>
        </li>
      {/if}
      {#if ErrorResponse}
        <li class:is-active={activeItem === 'error'} on:click={showError}>
          <a href="javascript:void(0);">ErrorResponse Sample</a>
        </li>
      {/if}  
    </ul>
  </div>
  <pre class="ez-response-sample">
    {@html activeItem === 'success' ? SuccessResponse.description : ErrorResponse.description}
  </pre>
{/if}

<script>
  export let apiData;

  let SuccessResponse;
  let ErrorResponse;
  let activeItem = '';

  $: if(apiData) {
    SuccessResponse = apiData.SuccessResponse;
    ErrorResponse = apiData.ErrorResponse;
    if (SuccessResponse) {
      activeItem = 'success';
    } else if (ErrorResponse) {
      activeItem = 'error';
    }
  }

  function showSuccess () {
    activeItem !== 'success' && (activeItem = 'success');
  }

  function showError () {
    activeItem !== 'error' && (activeItem = 'error');
  }
</script>

<style>
  .ez-response-sample {
    background:hsl(0, 0%, 21%);
    color:hsl(0, 0%, 96%);
    margin-bottom: 1rem;
  }
</style>