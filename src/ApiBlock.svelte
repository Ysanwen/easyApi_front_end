<ApiTitle apiData={apiData} group={belongGroup} on:changeApiVersion={changeApiVersion} />
<Params apiData={apiData} />
<ResponseDemo apiData={apiData} />
<SendRequest apiData={apiData} />

<script>
  import ApiTitle from './common/ApiTitle.svelte';
  import Params from './common/Params.svelte';
  import ResponseDemo from './common/ResponseDemo.svelte';
  import SendRequest from './common/SendRequest.svelte';

  export let apiData = {};
  export let belongGroup = ''

  function changeApiVersion (e) {
    apiData = e.detail;
  }

</script>