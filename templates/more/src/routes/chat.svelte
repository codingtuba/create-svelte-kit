<script context="module">
  export const load = async ({fetch}) => {
    return {
      status: 200,
      props: {
        chat: (await(await fetch(`/api`)).json()).chat
      }
    }
  }
</script>

<script>
  export let chat;
  let message;
  import Chat from "../components/chat_box.svelte"
  import { onMount } from "svelte";
  onMount(()=>{
    setInterval(async()=>{
      console.log('a')
      chat = (await(await fetch(`/api`)).json()).chat
    },750)
  })
</script>

{#each chat as message}
  <Chat content={message}/>
{/each}
<input type="text" bind:value={message}>
<button on:click={async()=>{
  await fetch(`/api`,{
    method: 'POST',
    body: message
  })
  message='';
}}>message</button>