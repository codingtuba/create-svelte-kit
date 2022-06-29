<script>
  import { onMount } from "svelte";
  import { fly, blur, scale } from "svelte/transition"
  let show=true;
  onMount(()=>{
    setInterval(()=>{
      show=!show
    },1500)
  })
</script>
<style>
  button{
    width:100px;
    height:100px;
    display:flex;
    justify-content:center;
    align-items:center;
    text-align:center;
    color: white;
    border: none;
  }
</style>

<p>Svelte is a compiled tool that allows you to crete applications such as Vue and React.</p>
<p>Svelte-kit allows you to use tools such as SSR and routing like Nuxt and Next.</p>
<p>Svelte has a foucs on ease of use, and is one of the most liked frameworks for JavaScript.</p>
<p>One cool tool that svelte has is a transitions API.</p>

<table>
  <tr>
    <td>slide</td>  
    <td>blur</td>  
    <td>scale</td>  
  </tr>  
  <tr>
    {#if show}
      <td transition:fly={{
        y: 50,
        duration: 1000,
      }}><button style="background-color:red">content</button></td>
      <td transition:blur={{
        duration: 1000,
        delay: 250
      }}><button style="background-color:blue">content</button></td>
      <td transition:scale={{
        duration: 1000,
        delay: 500
      }}><button style="background-color:green">content</button></td>
    {/if}
  </tr>
</table>