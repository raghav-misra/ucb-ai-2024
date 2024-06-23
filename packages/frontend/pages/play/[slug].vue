<script setup lang="ts">
import * as Colyseus from "colyseus.js";

const wsClient = useWSClient();

onMounted(async () => {
    wsClient.value.client = new Colyseus.Client("ws://localhost:2567");
    try {
        wsClient.value.room = await wsClient.value.client.create("my_room");

        //@ts-ignore
        window._wsClient = wsClient.value;
    } catch (ex) {
        console.error("Couldn't connect to room:", ex);
    }
});

const prompt = ref("");

function sendPrompt(evt: KeyboardEvent) {
    if (evt.shiftKey) return;

    evt.preventDefault(); 

    if (prompt.value === "") return; // no empty

    wsClient.value.room?.send("prompt", prompt.value);
    prompt.value = "";

    return false;
}
</script>

<template>
    <section class="region d-flex align-items-center justify-content-center">
        <div class="relaxed-box bg-black">
            <div class="city"></div>
            <div style="position: relative;">
                <textarea placeholder="Type here..." v-model.trim="prompt" style="resize: none;" class="lead input-box mb-0 bg-black p-4" @keydown.enter="sendPrompt"></textarea>
                <span class="enter-icon text-white d-flex align-items-center">↵</span>
            </div>
        </div>

        <!-- <PlayerDialogBox /> -->
    </section>
</template>

<style>
.region * {
    font-family: "VT323", sans-serif !important;
    color: white !important;
}
</style>

<style scoped>
.region {
    width: 100%;
    height: 100%;
    background-image: url(~/assets/region.png);
    background-position: center center;
    background-size: cover;
    position: relative;
}

.relaxed-box {
    width: 25rem;
    box-shadow: -0.5rem -0.5rem 2rem black, 0.5rem 0.5rem 2rem black;
    display: flex;
    flex-direction: column;
}

.input-box {
    border: none;
    outline: none;
    color: white;
    width: 100%;
    padding-right: 3rem !important;
    height: 5rem;
    line-height: 1.25rem;
}

.enter-icon {
    position: absolute;
    bottom: 0;
    top: 0;
    right: 1rem;
    pointer-events: none;
    font-size: 2rem;
}

.city {
    width: 25rem;
    height: 25rem;
    background-image: url(~/assets/city.png);
    background-position: center center;
    background-size: cover;
}
</style>