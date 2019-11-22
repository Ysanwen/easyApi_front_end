<nav class="ez-menu-area column is-2">
  <aside class="menu">
    {#each groupList as group}
      <ul class="menu-list">
        <li>
          <a href="#{group.groupName}">{group.groupName}</a>
          
          {#if group.subItems.length > 0}
            <ul>
              {#each group.subItems as subItem}
                <li><a href="#{subItem.title}">{subItem.description}</a></li>
              {/each}
            </ul>
          {/if}
        </li>
      </ul>
    {/each}
  </aside>
</nav>

<script>
  let groupList = [{
    groupName: 'default', 
    subItems: [
      {title: 'getDoc', description: '获取xxxx'},
      {title: 'postDoc', description: '提交xxxx'},
    ]
  }];
  
</script>

<style>
  .ez-menu-area {
    height: 100%;
    padding: 6px 8px;
    box-sizing: border-box;
    overflow-y: scroll;
    /* border-right: 1px solid #4DB6AC; */
    background: #eee;
  }
  .menu {
    padding-top: 8px;
  }
</style>