<style scoped>
  ul {
    display: flex;
    align-items: center;
    appearance: none;
    padding-left: 0;
  }
  li {
    padding: 5px;
    list-style: none;
  }
</style>
<ul class="nav">
  <li class="nav-link"><a href="/">Home</a></li>
  <li class="nav-link"><a href="/about">About Svelte</a></li>
  <li class="nav-link"><a href="/chat">Chat Example</a></li>
</ul>
<slot></slot>