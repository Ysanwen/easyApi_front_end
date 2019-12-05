{#if HeaderParam.length > 0 || UrlParam.length > 0 || QueryParam.length > 0 || BodyParam.length > 0}
<table class="table is-fullwidth is-bordered is-hoverable">
  <tbody>
    <tr>
      <th class="ez-param">参数类别</th>
      <th class="ez-param">字段</th>
      <th class="ez-param">类型</th>
      <th class="ez-param-description">描述</th>
    </tr>
    {#each HeaderParam as header, i}
      <tr>
        {#if i === 0}
          <td rowspan={HeaderParam.length}>HeaderParam</td>
        {/if}  
        <td>{header.key}  <span class={header.isRequired === false ? 'tag is-info is-light' : 'tag is-danger is-light'}>{header.isRequired === false ? '可选' : '必须'}</span></td>
        <td>{header.valueType}</td>
        <td>{header.description}</td>
      </tr>
    {/each}
    {#each UrlParam as url, i}
      <tr>
        {#if i === 0}
          <td rowspan={UrlParam.length}>UrlParam</td>
        {/if}  
        <td>{url.key}  <span class={url.isRequired === false ? 'tag is-info is-light' : 'tag is-danger is-light'}>{url.isRequired === false ? '可选' : '必须'}</span></td>
        <td>{url.valueType}</td>
        <td>{url.description}</td>
      </tr>
    {/each}
    {#each QueryParam as query, i}
      <tr>
        {#if i === 0}
          <td rowspan={QueryParam.length}>QueryParam</td>
        {/if}  
        <td>{query.key}  <span class={query.isRequired === false ? 'tag is-info is-light' : 'tag is-danger is-light'}>{query.isRequired === false ? '可选' : '必须'}</span></td>
        <td>{query.valueType}</td>
        <td>{query.description}</td>
      </tr>
    {/each}
    {#each BodyParam as body, i}
      <tr>
        {#if i === 0}
          <td rowspan={BodyParam.length}>BodyParam</td>
        {/if}  
        <td>{body.key}  <span class={body.isRequired === false ? 'tag is-info is-light' : 'tag is-danger is-light'}>{body.isRequired === false ? '可选' : '必须'}</span></td>
        <td>{body.valueType}</td>
        <td>{body.description}</td>
      </tr>
    {/each}
  </tbody>
</table>
{/if}
<script>
  export let apiData;

  let HeaderParam = [];
  let UrlParam = [];
  let QueryParam = [];
  let BodyParam = [];

  $: if(apiData) {
    HeaderParam = apiData.HeaderParam || [];
    UrlParam = apiData.UrlParam || [];
    QueryParam = apiData.QueryParam || [];
    BodyParam = apiData.BodyParam || [];
  }

</script>

<style>
  .ez-param {
    width: 15%;
  }
  .table td {
    vertical-align: middle;
  }
</style>