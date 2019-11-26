{#if openSideBar}
  <nav class="ez-menu-area column is-2">
    <aside class="menu" on:click={clickItem}>
      {#each groupList as group}
        <ul class="menu-list">
          <li>
            <a href="#{group.groupName}" class={activityItem === group.groupName ? "is-activity" : "not-activity"} data-click-group={group.groupName} data-click-name={group.groupName}>{group.groupName}</a>
            {#if group.subItems.length > 0}
              <ul>
                {#each group.subItems as subItem}
                  <li><a href="#{subItem.title}" class={activityItem === subItem.title ? "is-activity" : "not-activity"} data-click-group={group.groupName} data-click-name={subItem.title}>{subItem.title} - {subItem.description}</a></li>
                {/each}
              </ul>
            {/if}
          </li>
        </ul>
      {/each}
    </aside>
  </nav>
{/if}
<script>
  
  export let openSideBar = true;
  export let groupList = [];

  let activityGroup = '';
  let activityItem = '';

  function clickItem (e) {
    if (e.target && e.target.dataset) {
      let clickGroup =  e.target.dataset.clickGroup;
      let clickName =  e.target.dataset.clickName;
      if (clickGroup && clickName) {
        activityGroup = clickGroup;
        activityItem = clickName;
      }
    }
  }
  
</script>

<style>
  .ez-menu-area {
    height: 100%;
    padding: 6px 8px;
    box-sizing: border-box;
    overflow-y: scroll;
    /* border-right: 1px solid #4DB6AC; */
    background:hsl(0, 0%, 98%);
  }
  .menu {
    padding-top: 8px;
  }
  .menu-list a {
    color: #4DB6AC;
  }
  .menu-list .is-activity {
    color: #fff;
    background: #4DB6AC;
  }
</style>