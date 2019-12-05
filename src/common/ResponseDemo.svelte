{#if (SuccessResponse && SuccessResponse.length > 0) || (ErrorResponse && ErrorResponse.length > 0)}
  <div class="tabs is-boxed">
    <ul>
      {#each SuccessResponse as response, index}
        <li class:is-active={activeItem === 'success' && activeIndex === index} on:click={() => showSuccess(index)}>
          <a href="javascript:void(0);">SuccessResponse {response.responseCode}</a>
        </li>
      {/each}
      {#each ErrorResponse as response, index}
        <li class:is-active={activeItem === 'error' && activeIndex === index} on:click={() => showError(index)}>
          <a href="javascript:void(0);">ErrorResponse {response.responseCode}</a>
        </li>
      {/each}  
    </ul>
  </div>
  <pre class="ez-response-sample">
    {@html activeItem === 'success' ? SuccessResponse[activeIndex].description : ErrorResponse[activeIndex].description}
  </pre>
{/if}

<script>
  export let apiData;

  let SuccessResponse;
  let ErrorResponse;
  let activeItem = '';
  let activeIndex = 0;

  $: if(apiData) {
    SuccessResponse = apiData.SuccessResponse || [];
    ErrorResponse = apiData.ErrorResponse || [];
    if (SuccessResponse && SuccessResponse.length > 0) {
      activeItem = 'success';
    } else if (ErrorResponse && ErrorResponse.length > 0) {
      activeItem = 'error';
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
</script>

<style>
  .ez-response-sample {
    background:hsl(0, 0%, 21%);
    color:hsl(0, 0%, 96%);
    margin-bottom: 1rem;
  }
</style>