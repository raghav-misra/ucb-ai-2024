<script setup lang="ts">
import * as Colyseus from "colyseus.js";
import Swal from "sweetalert2";
import { useNProgress } from '@vueuse/integrations/useNProgress'

const gameInitialState = useGameInitialState();


const { isLoading } = useNProgress()


definePageMeta({
    middleware: ["auth"]
});

const wsClient = useWSClient();
const gameRoomState = useGameRoomState();
const user = useUser();
const imageState = useImageState();
const { showDialog, queueDialog, messageQueue } = useDialog();
const messageState = useMessageState();
const sceneLogs = useSceneLogs();
const locationState = useLocationState();

const view = {
    curr: ref('LOADING'),
    go(loc: string) {
        this.curr.value = loc;
        sceneLogs.value.conversation.length = 0;
        sceneLogs.value.battle.length = 0;
    },
    is(loc: string) {
        return this.curr.value === loc;
    }
};

onBeforeMount(async () => {
    if (gameInitialState.value === null) {
        await Swal.fire("Please launch a game from the dashboard.", "Redirecting you there now...", "info");
        navigateTo("/dashboard");
    }

    //@ts-ignore
    window._wsClient = wsClient.value;

    wsClient.value.client = new Colyseus.Client("ws://localhost:2567");
    try {
        wsClient.value.room = await wsClient.value.client.create("my_room");
    } catch (ex) {
        console.error("Couldn't connect to room:", ex);
        return;
    }

    wsClient.value.room.send("GET_DB_INFO", {
        dbName: gameInitialState.value.dbName,
        name: gameInitialState.value.name
    });

    wsClient.value.room.onStateChange((state: IGameRoomState) => {
        debugger;
        gameRoomState.value = JSON.parse(JSON.stringify(state));
        console.log("state changed!");

        try {
            const self = getCharacterFromId(user.value.userId);
            const scene = gameRoomState.value.scenes.find(s => s.sceneId === self.sceneId);
            view.go(scene.sceneType);

            imageState.value.region = `http://localhost:59163/` + scene.regionImage;
            imageState.value.city = `http://localhost:59163/` + scene.cityImage;

            locationState.value.region = scene.regionString;
            locationState.value.city = scene.cityString;
            locationState.value.poi = scene.poiString;
        } catch (ex) {
            console.log(ex);
            console.log("no scene yet...");
        }
    });

    // wsClient.value.room.send("NEW_CHARACTER", {
    //     userId: user.value.userId,
    //     name: "twizz",

    //     currency: 0,
    //     health: 100,
    //     strength: 0,
    //     constitution: 0,
    //     intelligence: 0,
    //     energy: 0,
    //     wisdom: 0,
    //     dexterity: 0,
    //     charisma: 0,

    //     sceneId: 20,

    //     city: "Pleasanton",
    //     region: "California"
    // } as IGameCharacter);

    // wsClient.value.room.send("NEW_SCENE", {
    //     sceneId: 20,
    //     sceneType: "default",
    //     messages: [],
    // } as IGameScene);

    // wsClient.value.room.onMessage("GOTO", (message: string) => {
    //     console.log(message);
    //     view.go(message)
    // });

    wsClient.value.room.onMessage("NEW_MESSAGE", ({ characterName, message }) => {
        messageState.value.push({ characterName, message });
        isLoading.value = false

        if (view.is("DEFAULT")) {
            messageQueue.value.push({ characterName, message });
        } else if (view.is("CONVERSATION")) {
            sceneLogs.value.conversation.push({ characterName, message });
        } else if (view.is("BATTLE")) {
            sceneLogs.value.battle.push({ characterName, message });
        }
    });

   
    wsClient.value.room.onMessage("GET_ITEM", ({ itemName, characterID, amount, image }) => {
        const isUser = user.value.userId === characterID
        if(isUser){
            Swal.fire({
                title: "You got an item!",
                text: `You got ${amount}x ${itemName}`,
                imageUrl: image,
            })
        }
    })
});
</script>

<template>
    <section class="region d-flex align-items-center justify-content-center"
        :style="{ backgroundImage: `url('${imageState.region}')` }">
        
        <PlayerDefaultPage v-if="view.is('DEFAULT')" />
        <PlayerBattlePage v-if="view.is('BATTLE')" />
        <PlayerConversationPage v-if="view.is('CONVERSATION')" />

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
    background-position: center center;
    background-size: cover;
    position: relative;
}
</style>