{#if openSideBar}
  <nav class="ez-menu-area column is-2">
    <aside class="menu" on:click={clickItem}>
      {#each displayGroupList as group}
        <ul class="menu-list">
          <li>
            <span data-click-group={group.groupName} class="ez-group-title">
              {#if group.subItems.length > 0}
              <span class="icon icon-item"><i class="fas fa-angle-up"></i></span>
              {:else}
              <span class="icon icon-item"><i class="fas fa-angle-right"></i></span>
              {/if}
              {group.groupName}
            </span>
            {#if group.subItems.length > 0}
              <ul>
                {#each group.subItems as subItem}
                  <li>
                    <a href="#{group.groupName}-{subItem.title}"
                      class={$activityGroup === group.groupName && $activityItem === subItem.title ? "is-activity" : "not-activity"}
                      data-click-group={group.groupName}
                      data-click-name={subItem.title}>{subItem.title} - {subItem.description}</a>
                  </li>
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
  import { activityGroup, activityItem } from './store.js';
  export let openSideBar = true;
  export let groupList = [];
  let displayGroupList = [];

  $: if (groupList) {
    displayGroupList = groupList.map((item) => {
      return Object.assign({},item);
    });
  }

  function clickItem (e) {
    if (e.target && e.target.dataset) {
      let clickGroup =  e.target.dataset.clickGroup;
      let clickName =  e.target.dataset.clickName;
      if (clickGroup && clickName) {
        activityGroup.set(clickGroup);
        activityItem.set(clickName);
      } else if (clickGroup && !clickName) {
        let len = displayGroupList.length;
        for (let i = 0; i < len; i++) {
          if (displayGroupList[i].groupName === clickGroup) {
            let getItem = displayGroupList[i];
            if (getItem.subItems.length > 0) {
              getItem._subItems = getItem.subItems || [];
              getItem.subItems = [];
            } else {
              getItem.subItems = getItem._subItems || [];
              getItem._subItems = [];
            }
            displayGroupList = [...displayGroupList];
            break;
          }
        }
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
  .ez-group-title {
    cursor: pointer;
    color: #4DB6AC;
  }
  .menu {
    display: inline-block;
    padding-top: 8px;
    padding-left: 6px;
  }
  .menu-list a {
    color: #4DB6AC;
  }
  .menu-list .is-activity {
    color: #fff;
    background: #4DB6AC;
  }
</style>