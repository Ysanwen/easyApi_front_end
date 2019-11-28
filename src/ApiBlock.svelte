<ApiTitle apiData={apiData} group={belongGroup} on:changeApiVersion={changeApiVersion}/>
<Params apiData={apiData}/>

<script>
  import ApiTitle from './common/ApiTitle.svelte';
  import Params from './common/Params.svelte';

  export let apiData = {};
  export let belongGroup = ''

  function changeApiVersion (e) {
    apiData = e.detail;
  }

</script>