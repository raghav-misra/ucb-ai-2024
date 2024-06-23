<script setup lang="ts">
import * as Colyseus from "colyseus.js";

const view = {
    curr: ref('conversation'),
    go(loc: string) {
        this.curr.value = loc;
    },
    is(loc: string) {
        return this.curr.value === loc;
    }
};

definePageMeta({
    middleware: ["auth"]
});

const wsClient = useWSClient();
const gameRoomState = useGameRoomState();
const user = useUser();

onBeforeMount(async () => {
    //@ts-ignore
    window._wsClient = wsClient.value; 

    wsClient.value.client = new Colyseus.Client("ws://localhost:2567");
    try {
        wsClient.value.room = await wsClient.value.client.create("my_room");
    } catch (ex) {
        console.error("Couldn't connect to room:", ex);
        return;
    }

    wsClient.value.room.onStateChange((state: IGameRoomState) => {
        gameRoomState.value = JSON.parse(JSON.stringify(state));
        console.log("state changed!");
    });

    wsClient.value.room.send("NEW_CHARACTER", {
        userId: user.value.userId,
        name: "twizz",

        currency: 0,
        health: 100,
        strength: 0,
        constitution: 0,
        intelligence: 0,
        energy: 0,
        wisdom: 0,
        dexterity: 0,
        charisma: 0,

        sceneId: "20",

        city: "Pleasanton",
        region: "California"
    } as IGameCharacter);

    wsClient.value.room.send("NEW_SCENE", {
        sceneId: "20",
        sceneType: "default",
        messages: [],
    } as IGameScene);

    wsClient.value.room.onMessage("GOTO", (message: string) => {
        console.log(message);
        view.go(message)
    });
});
</script>

<template>
    <section class="region d-flex align-items-center justify-content-center">
        <PlayerDefaultPage v-if="view.is('default')" />
        <PlayerBattlePage v-if="view.is('battle')" />
        <PlayerConversationPage v-if="view.is('conversation')" />

        <PlayerDialogBox />
        <PlayerStatsCard />
    </section>
</template>

<style>
.region * {
    font-family: "VT323", sans-serif !important;
    color: white;
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
</style>