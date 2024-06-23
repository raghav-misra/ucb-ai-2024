<script setup lang="ts">
import { useNProgress } from '@vueuse/integrations/useNProgress'
const { isLoading } = useNProgress();
const { showDialog } = useDialog();

const { prompt, sendPrompt } = usePrompt();

const user = useUser();
const player = computed(() => getCharacterFromId(user.value.userId));
const imageState = useImageState();
const messageState = useMessageState();
const activeCharacter = computed(() => {
    return messageState.value[messageState.value.length - 1]?.characterID ||
        gameRoomState.value.characters.find(c => c.userId === user.value.userId);
});
</script>

<template>
    <div class="relaxed-box bg-black rounded" style="overflow: hidden;">
        <div class="city d-flex justify-content-center align-items-center"
        :style="{ backgroundImage: `url(${imageState.city})` }">
            <div class="bg-black py-2 px-3 rounded shadow-lg" style="opacity: 0.8;">
                <p class="mb-0 lead">
                    {{ player?.city }}, {{ player?.region  }} 📍
                </p>
            </div>
        </div>
        <div style="position: relative;">
            <textarea :disabled="isLoading" twizz="Type here..." v-model.trim="prompt" style="resize: none;"
                class="lead input-box mb-0 bg-black p-4" @keydown.enter="sendPrompt"></textarea>
            <span class="enter-icon text-white d-flex align-items-center">↵</span>
        </div>
    </div>
</template>

<style scoped>
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
    background-position: center center;
    background-size: cover;
}
</style>